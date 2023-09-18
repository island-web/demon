const path = require('path');
const fs = require('fs-extra');
const os = require('os');
const { notification } = require(path.join(__dirname, '..', 'notifier', 'win_notifier.js'));
const shell = require('shelljs');


exports.handler_msg_display = async (packet) => { notification(packet.data.name, package.data.message) }
exports.handler_msg_err = async (packet) => { 
    
    switch (packet.data.command) {
        case 'no_schedule_work':
            console.log('no_schedule_work');
        break;
    }
}


exports.handler_msg_command = async (packet) => {
    

    switch (packet.data.command) {
        case 'config_ok':
            const command = path.join(__dirname, '..', 'modules', 'schedule.js');
            await shell.exec(`node ${command}`);
        break;

        case 'end_download_adv':
            try {
                fs.writeFile(path.join(homedir, 'demon-84', '.managerDemon_84', 'commands', 'player.json'), JSON.stringify({ command: "reload", message: "mes" }, 'utf-8'));
            } catch (error) { console.log(error) }
            break;

        default: break;
    }
}


