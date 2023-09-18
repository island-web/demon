//v3.0.5


//DEPENDENCIES
const { ipcRenderer } = require('electron');
const fs = require('fs-extra');
const path = require('path');
const chokidar = require('chokidar');
const os = require('os');
const pm2 = require('pm2');
const { exec } = require('child_process');



//CONSTANTS
const { interval, fixed } = new Audio();
const homedir = os.homedir();
const __demon_84 = path.join(homedir, 'demon-84');
const musicPath = path.join(__demon_84, 'music');
const adv = path.join(__demon_84, 'adv');
//const options = path.join(__demon_84, 'configs', 'options.json');
const __path_mod = path.join(__demon_84, '.managerDemon_84');
const manager_command = path.join(__demon_84, ".managerDemon_84", "commands", "manager.json");
const info_space = document.getElementById('info_space');


//REQUIRES
const tempus = require('./tempus');
const { printContent } = require('./visual');
const {
    preparationProgramm, get_command, createElement, check_processes
} = require('./modules');
const { start, stopWork } = require('./play_controller');

//VARIABLES

const optionsPlayerWork = {
    status: 'stop',
};






const filePathWatcher = path.join(__demon_84, '.managerDemon_84', 'commands', 'player.json');
const watcher = chokidar.watch(filePathWatcher);

watcher.on('change', (path) => { get_command() });
check_processes();



//make header
(() => {
    try {

        if(fs.existsSync(path.join(__demon_84, '.managerDemon_84', 'storage', 'options.json'))){

            const options = path.join(__demon_84, 'configs', 'options.json');
            const opt = JSON.parse(fs.readFileSync(options));
            console.log(opt.start_app, opt.stop_app);
            if (tempus.between(opt.start_app, opt.stop_app)) {
                fs.writeFileSync(path.join(manager_command), JSON.stringify({ command: 'player_log', log: 'Завантаження конфігурації музичної програми' }));
                optionsPlayerWork.status = 'work';
                preparationProgramm();
            }else{
               
                fs.writeFileSync(path.join(manager_command), JSON.stringify({ command: 'player_log', log: 'Поза часом роботи програми' }));
                fs.writeFileSync(path.join(manager_command), JSON.stringify({ command: 'player_log', log: 'Зупинка програми' }));
                optionsPlayerWork.status = 'stop';
                stopWork();

            }
        }

       setTimeout(() => {
        document.getElementById('time').innerHTML = tempus.current_time() + ' ' + tempus.current_date();
       }, 1000);
    } catch (error) { throw error }

    //save info about player

    if (fs.existsSync(path.join(__demon_84, '.managerDemon_84', 'storage'))){
        try{
            console.log('player.js', __dirname);
            const info = {
                version: JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf-8')).version,
                platform: process.platform,
                arch: process.arch,
                pathPlayer: __dirname,
                time: tempus.current_time()
            }
            fs.writeFileSync(path.join(__demon_84, '.managerDemon_84', 'storage', 'player_info.json'), JSON.stringify(info, 'utf-8'));
        }catch(error){ throw error }
    }

})();


