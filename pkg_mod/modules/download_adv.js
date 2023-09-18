


const processName = "DOWNLOAD ADV";

const path = require('path');
const fs = require('fs').promises;
const os = require('os');
const chokidar = require('chokidar');
const Downloader = require("nodejs-file-downloader");


const MY_HOST = 'https://infiniti-pro.com/';
const PATH_CONFIG_FILE = path.join(__dirname, '..', 'storage', 'config.json');
const PATH_ADV = path.join(os.homedir(), 'demon-84', 'adv');

const counter = {
    error_download_adv: 0
}



async function main() {
    try {
        const configData = await fs.readFile(PATH_CONFIG_FILE, 'utf8');
        const DATA_CLIENT = JSON.parse(configData);
        const ALL_ADV = DATA_CLIENT.all_adv;
        console.log('ALL_ADV:', ALL_ADV);


        const missingAdv = await checkmissingAdv(ALL_ADV);
        if (missingAdv.length > 0) { 
            await downloadAdv(missingAdv);
            process.send({ 
                type :"process:desktop", 
                data : { name: processName, message: 'Розпочато завантаження рекламного контенту' } 
            });
        }
        
    } catch (error) { console.error('Error: start download adv' + error) }
}

async function checkmissingAdv(all_adv) {
    const missingAdv = [];

    for (const key of Object.keys(all_adv)) {
        const songPath = path.join(PATH_ADV, all_adv[key].name_adv);

        try { await fs.access(songPath) }
        catch (error) { missingAdv.push(all_adv[key].name_adv) }
    }

    return missingAdv;
}

async function downloadAdv(obj) {
    process.send({ type :"process:download_adv", data : { command: 'info_download_adv', message: "Розпочато завантаження рекламного контенту", name: 'TMM [ downloader ]'} })

    let count_adv_downloaded = 0;
    
    while (count_adv_downloaded < obj.length) {
    
        const path_file = path.join(MY_HOST, 'adv', obj[count_adv_downloaded]);
        console.log('START DOWNLOAD ADV:', obj[count_adv_downloaded]);

        try {
            const downloader = await new Downloader({ url: path_file, directory: PATH_ADV });
            const { filePath, downloadStatus } = await downloader.download();
            console.log('END DOWNLOAD ADV:', obj[count_adv_downloaded]);
            process.send({ type :"process:download_adv", data : { command: 'info_download_adv', message: `Завантаження: ${obj[count_adv_downloaded]}`, name: 'TMM [ downloader ]'} })
            count_adv_downloaded++;
            
        }
        catch (error) {
            console.error('Error downloading adv:', obj[count_adv_downloaded], error);
            counter.error_download_adv++;
        }

    }

    process.send({ type :"process:end_download_adv", data : { command: 'end_download_adv', name: 'TMM [ downloader ]'} });
    return;
}

main();




//handler command from other processes
const filePathWatcher = path.join(__dirname, '..', 'command', 'download_adv.json');
const watcher = chokidar.watch(filePathWatcher);
watcher.on('change', (path) => { get_command() });
watcher.on('error', (error) => { console.error(`Ошибка при отслеживании файла: ${error}`) });


function get_command() {
    fs.readFile(filePathWatcher, 'utf8')
        .then((data) => {
            const command = JSON.parse(data);
            if (command.command === 'start_download_adv') { main() }
        })
        .catch((error) => { console.error(`Ошибка при чтении файла: ${error}`) })
}