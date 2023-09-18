const si = require('systeminformation');
const os = require('os');
const fs = require('fs');
const path = require('path');

const all_info_machine = {};

async function getInfoMachine(socket = null) {
    const cpu_information = {};
    const operation_system = {
        operation_system: os.type(),
        release: os.release(),
        arch: os.arch(),
        hostname: os.hostname()
    };
    const memory_system = {
        total: convertBytesToGB(os.totalmem()),
        free: convertBytesToGB(os.freemem())
    };

    // Получение информации о каждом процессоре
    const cpus = os.cpus();
    os.cpus().forEach((cpu) => {
        const { model, speed, cores } = cpu;
        cpu_information[model] = {
            model,
            speed: convertMegahertz(speed),
            cores,
        };
    });

    // Получение информации о температуре процессоров с помощью модуля systeminformation
    try {
        const { cores } = await si.cpuTemperature();
        cores.forEach((coreTemp, index) => {
            const model = cpus[index].model;
            cpu_information[model].temperature = convertCelsius(coreTemp);
        });

        const disk_info = await si.diskLayout();
        const disks = [];
        for (const disk of disk_info) {
            const { device, type, size, name, vendor } = disk;
            const diskSizeGB = convertBytesToGB(size);
            const { available } = await si.fsSize(device);
            const availableSpaceGB = available ? convertBytesToGB(available) : 'Не удалось получить информацию';
            disks.push({ device, type, size: diskSizeGB, available: availableSpaceGB, name, vendor });
        }


        const audio_info = await si.audio();
        const audio = [];
        for (const audio_device of audio_info) {
            const { channel, driver, manufacturer, name, status } = audio_device;
            audio.push({ channel, driver, manufacturer, name, status});
        }


        all_info_machine.cpu = cpu_information;
        all_info_machine.os = operation_system;
        all_info_machine.memory = memory_system;
        all_info_machine.disks = disks;
        all_info_machine.audio = audio;

        fs.writeFileSync(path.join(__dirname, '..', 'storage', 'info_machine.json'), JSON.stringify(all_info_machine), null, 4);
    } catch (error) {
        console.error(error);
    }
}

function convertBytesToGB(bytes) {
    const gb = bytes / (1024 * 1024 * 1024);
    return `${gb.toFixed(2)} GB`;
}

function convertCelsius(temp) {
    return `${temp.toFixed(2)}°C`;
}

function convertMegahertz(speed) {
    const megahertz = speed / 1000;
    return `${megahertz.toFixed(2)} МГц`;
}

module.exports = {
    getInfoMachine
}
