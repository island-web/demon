//name: MANAGER
//version: 3.0.5
//description: This is the main file of the project. It will be responsible for managing the other files and executing the commands.
//MANAGER make the communication between the user and the other files.
//MANAGER run other processes and files.
//DEPENDENCIES
const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const homedir = os.homedir();
const shell = require('shelljs');
const pm2 = require('pm2');
const chokidar = require('chokidar');
const { get } = require('http');




const status = JSON.parse(fs.readFileSync(path.join(__dirname, 'storage', 'init.json')), 'utf-8');
const send_command_player = (com, mes = '') => {
    try {
        fs.writeFileSync(path.join(homedir, 'demon-84', '.managerDemon_84', 'commands', 'player.json'), JSON.stringify({ command: com, message: mes }, 'utf-8'));
    } catch (error) { console.log(error) }
}



const filePath = path.join(__dirname, 'commands', 'manager.json');
const watcher = chokidar.watch(filePath);
watcher.on('change', () => { get_command() });


const hand = path.join(__dirname, 'controllers', 'handling.js');
const sock = path.join(__dirname, 'modules', 'socket.js');
const down_s = path.join(__dirname, 'modules', 'download_songs.js');
const down_a = path.join(__dirname, 'modules', 'download_adv.js');
const notif = path.join(__dirname, 'modules', 'notification.js');
const updater = path.join(__dirname, 'updater.js');







//**************************************************************************************************************************** */





//REQUIRED
require(path.join(__dirname, 'modules', 'si.js')).getInfoMachine();
const { notification } = require(path.join(__dirname, 'notifier', 'win_notifier.js'));
const { handler_msg_command, handler_msg_display, handler_msg_err } = require(path.join(__dirname, 'controllers', 'handling.js'));

//CONSTANTS
const osInfo = { platform: os.platform(), arch: os.arch(), release: os.release(), type: os.type() };
fs.writeFileSync(path.join(__dirname, 'storage', 'info_machine.json'), JSON.stringify(osInfo), null, 4);

//run the processes
connect_pm();




//FUNCTIONS
function connect_pm() {
    pm2.connect((err) => {
        console.log('pm2 connect')
        if (err) { return pm2.disconnect() }

        pm2.start(
            [
                { script: updater, name: 'UPDATER', maxRestarts: 10, maxMemoryRestart: '1G', exec_mode: 'fork' },
                { script: hand, name: 'HENDLING', maxRestarts: 10, maxMemoryRestart: '1G', exec_mode: 'fork' },
                { script: sock, name: 'SOCKET', maxRestarts: 10, maxMemoryRestart: '1G', exec_mode: 'fork' }
            ],
            (err) => {
                if (err) { console.error(err); return pm2.disconnect() }

                pm2.start(
                    [
                        { script: notif, name: 'NOTIFICATION', maxRestarts: 10, maxMemoryRestart: '100M', exec_mode: 'fork' },
                        { script: down_s, name: 'DOWNLOAD - S', maxRestarts: 10, maxMemoryRestart: '1G', exec_mode: 'fork' },
                        { script: down_a, name: 'DOWNLOAD - A', maxRestarts: 10, maxMemoryRestart: '1G', exec_mode: 'fork' }
                    ],
                    (err) => { if (err) { console.error(err); return pm2.disconnect() }
                });
            });


        pm2.launchBus(function (err, message) {

            message.on('process:notification_time', function (packet) { console.log(Object.keys(packet)); send_command_player(packet.data.command) });
            message.on('process:notification_interval', function (packet) { console.log(packet); send_command_player(packet.data.command, packet.data.minutes) });
            message.on('process:command', function (packet) { handler_msg_command(packet) });
            message.on('process:desktop', function (packet) { notification(packet.data.name, packet.data.message) });
            message.on('process:error', function (packet) { handler_msg_err(packet) });
            message.on('process:download_songs', function (packet) { send_command_player(packet.data.command, packet.data.message) });
            message.on('process:end_download_songs', function (packet) {
                try {
                    const init = fs.readFileSync(path.join(homedir, 'demon-84', '.managerDemon_84', 'storage', 'init.json'));
                    const init_data = JSON.parse(init);
                    if (init_data.first_start === "init_start") {
                        init_data.first_start = false;
                        fs.writeFileSync(path.join(__dirname, 'storage', 'init.json'), JSON.stringify(init_data), null, 4);
                    }
                } catch (error) { console.log(error) }
                finally {
                    const com = path.join(__dirname, 'modules', 'schedule.js');
                    shell.exec(`node ${com}`, (err, stdout, stderr) => {
                        if (err) { console.log(err) } 
                        send_command_player("reload", "null");
                    });
                    
                }
            });
        });
    })


}


const get_command = async () => {

    let comd;
    try {
        const data = fs.readFileSync(path.join(homedir, 'demon-84', '.managerDemon_84', 'commands', 'manager.json'))
        comd = JSON.parse(data);
        console.log(comd);
        switch (comd.command) {
            
            case 'player_start':
                console.log('player_start');
                break;

            case 'start_reload_player':
                console.log(comd.message);
                break;

            case 'restart_download_processes':
                pm2.restart('NOTIFICATION',(err) => { if (err) { console.log(err) } });
                pm2.restart('DOWNLOAD - S', (err) => { if (err) { console.log(err) } });
                pm2.restart('DOWNLOAD - A', (err) => { if (err) { console.log(err) } });
                break;

            case 'player_log':
                const data = { command: 'log_from_client', body: comd.log, type: 'success'};
                try{ fs.writeFileSync(path.join(__dirname, 'commands', 'socket_command.json'), JSON.stringify(data), null, 4) }
                catch(error){console.log(error, 'player_log')}
            break

            default: break;
        }

    }
    catch (error) { console.log("try one more time get signal from manager"); get_command(); return }

}