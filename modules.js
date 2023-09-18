

//DEPENDENCIES
const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const cron = require('cron');
const { exec } = require('child_process'); // Модуль для выполнения команд в терминале



//CONSTANTS
const homedir = os.homedir();
const __demon_84 = path.join(homedir, 'demon-84');
const options = path.join(__demon_84, 'configs', 'options.json');
const musicPath = path.join(__demon_84, 'music');
const adv = path.join(__demon_84, 'adv');
const filePathWatcher = path.join(__demon_84, '.managerDemon_84', 'commands', 'player.json');
const __path_mod = path.join(__demon_84, '.managerDemon_84');
const manager_command = path.join(__demon_84, ".managerDemon_84", "commands", "manager.json");
const info_space = document.getElementById('info_space');


//create playlist for curren time, source: `__demon_84, 'configs', 'options.json'`

const createPlaylist = () => {

    fs.writeFileSync(path.join(manager_command), JSON.stringify({ command: 'player_log', log: 'Підготовка плейліста' }));

    const OPTIONS = JSON.parse(fs.readFileSync(path.join(options)), 'utf-8');
    const playlist_current_time = [];

    for (const obj of OPTIONS.all_music_today) {
        if (moment().format('HH:mm:ss') >= obj.time_start && moment().format('HH:mm:ss') < obj.time_stop) {
            playlist_current_time.push(obj);
        }
    }
    return playlist_current_time;
}

const get_command = () => {

    try {
        const com = fs.readFileSync(filePathWatcher);
        const comd = JSON.parse(com);
        console.log(comd.command);
        switch (comd.command) {
            //************************************************************************************ */

            case 'interval':
                if(optionsPlayerWork.status === 'work'){
                    try {
                        const interval = JSON.parse(fs.readFileSync(path.join(options)), 'utf-8').adv_interval;
                        const playlist_interval = interval.filter((obj) => { if (obj.interval_t === comd.minutes && tempus.between(obj.time_start, obj.time_stop)) { return obj } });
                            console.log('playlist_interval', playlist_interval);
                        if (playlist_interval.length > 0) {
                            fs.writeFileSync(path.join(manager_command), JSON.stringify({ command: 'player_log', log: 'Підготовка запуску інтервальної реклами' }));
                            try { fs.writeFileSync(path.join(__dirname, 'eventsController.json'), JSON.stringify({ command: "play_interval", playlist: playlist_interval }, 'utf-8')) }
                            catch (error) { console.log('57str' + error) }
                        }
    
                    } catch (error) { console.log('60str' + error) }
                }else{
                    console.log('Поза часом роботи програми');
                }
            break;
            //************************************************************************************ */
            case 'FIX':
                const fixed_list = JSON.parse(fs.readFileSync(path.join(options)), 'utf-8').adv_fix;
                const fixed = fixed_list.filter((obj) => { if (obj.fix === comd.time) { return obj } });

                fs.writeFileSync(path.join(manager_command), JSON.stringify({ command: 'player_log', log: 'Підготовка запуску реклами з фіксованим стартом' }));
                try { fs.writeFileSync(path.join(__dirname, 'eventsController.json'), JSON.stringify({ command: "play_fix", adv: fixed }, 'utf-8')) }
                catch (error) { console.log('74str' + error) }


            brake;
             //************************************************************************************ */
            case 'info_download_songs':
                createElement('p', comd.command + '_' + tempus.current_time('mm:ss'), 'p-info-install', info_space, `[ ${tempus.current_time()} ] ===> ${comd.message}`);
                break;
            //************************************************************************************ */

            case "info_download_songs_error":
                createElement('p', comd.command + '_' + tempus.current_time('mm:ss'), 'p-info-error', info_space, `[ ${tempus.current_time()} ] ===> ${comd.message}`);
                break;
            //************************************************************************************ */

            case 'reload':
                setTimeout(() => { ipcRenderer.send('reload') }, 5000);
                break;
            //************************************************************************************ */INTERVAL
            case 'WORK':
                fs.writeFileSync(path.join(manager_command), JSON.stringify({ command: 'player_log', log: 'Перезавантаження музичного плеєра' }));
                setTimeout(() => { ipcRenderer.send('reload') }, 2000);
                break;
            //************************************************************************************ */
                case 'update':
                    fs.writeFileSync(path.join(manager_command), JSON.stringify({ command: 'player_log', log: 'Оновлення музичного плеєра' }));
                    const command = 'node ' + path.join(__dirname, 'updater_player.js');
                    exec(command, (error, stderr, stdout) => {
                        if (error) { console.error(`exec error: ${error}`); return }
                        console.log(stderr);
                        console.log(stdout);
                    });
                    break;

        }
    } catch (error) { throw error }
}

function createElement(tag, id, className = 'errorcode', parent, content = 'null') {

    const element = document.createElement(tag);
    element.id = id;
    element.className = className;
    parent.prepend(element);

    if (content != 'null') { printContent(id, content, 40) }
}

const send_message_manager = (comm, mes) => {
    try { fs.writeFileSync(manager_command, JSON.stringify({ command: comm, message: mes }, 'utf-8')) }
    catch (error) { console.log("Error send message to manager") }
}

const check_processes = () => {

    if (fs.existsSync(path.join(__demon_84, '.managerDemon_84', 'storage', 'init.json'))) {

        const version = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'))).version;
        const passport = JSON.parse(fs.readFileSync(path.join(__path_mod, 'storage', 'passport.json')));

        document.getElementById('version').innerHTML = version;
        document.getElementById('name-station').innerHTML += passport.name;

        pm2.connect((err) => {
            if (err) {
                console.error(err);
                process.exit(2);
            }

            pm2.list((err, processList) => {
                if (err) {
                    console.error(err);
                    pm2.disconnect();
                    return;
                }

                try {
                    if (processList.length === 0) {
                        createElement('p', tempus.current_time('mm:ss'), 'p-info-install', info_space, `[ ${tempus.current_time()} ] ===> MANAGER process not found. Start processes ...`)
                        exec('cd ' + __path_mod + ' && npx pm2 start ecosystem.config.js', { encoding: 'utf-8' }, (error, stdout, stderr) => {
                            if (error) { console.log(error) }
                            else {
                                const paragraf = document.createElement('p');
                                paragraf.id = tempus.current_time('mm:ss');
                                paragraf.className = 'p-info-install';
                                paragraf.innerHTML = `[ ${tempus.current_time()} ] ===> ${stdout}`;
                                info_space.prepend(paragraf);
                            }
                        });
                    }
                    else {
                        for (key of Object.keys(processList)) {
                            if (processList[key].name === 'MANAGER' && processList[key].pm2_env.status === 'online') {
                                createElement('p', tempus.current_time('mm:ss'), 'p-info-install', info_space, `[ ${tempus.current_time()} ] ===> ${processList[key].name} status: ${processList[key].pm2_env.status}`);
                                createElement('p', tempus.current_time('mm:ss'), 'p-info-install', info_space, `[ ${tempus.current_time()} ] ===> Check new content ...`);
                                send_message_manager('restart_download_processes');
                            } else if (processList[key].name === 'MANAGER' && processList[key].pm2_env.status === 'stopped') {
                                createElement('p', tempus.current_time('mm:ss'), 'p-info-install', info_space, `[ ${tempus.current_time()} ] ===> ${processList[key].name} status: ${processList[key].pm2_env.status}`);
                                createElement('p', tempus.current_time('mm:ss'), 'p-info-install', info_space, `[ ${tempus.current_time()} ] ===> Start process ...`);
                                exec('cd ' + __path_mod + ' && npx pm2 start ecosystem.config.js', { encoding: 'utf-8' }, (error, stdout, stderr) => {
                                    if (error) { console.log(error) }
                                    else {
                                        const paragraf = document.createElement('p');
                                        paragraf.id = tempus.current_time('mm:ss');
                                        paragraf.className = 'p-info-install';
                                        paragraf.innerHTML = `[ ${tempus.current_time()} ] ===> ${stdout}`;
                                        info_space.prepend(paragraf);
                                    }
                                });
                            }
                        }
                    }
                } catch (error) { console.log(error) }
                finally { pm2.restart('DOWNLOAD - S') }

                pm2.disconnect();
            });
        });
    }


}

const preparationProgramm = () => {

    const programm_day = {};
    try {
        createElement('p', tempus.current_time('mm:ss'), 'p-info-install', info_space, `[ ${tempus.current_time()} ] ===> Preparation playlists ...`);
        programm_day['playlist'] = createPlaylist();
    } catch (error) { console.log(error) }
    finally {
        fs.writeFileSync(path.join(__dirname, 'programm_day.json'), JSON.stringify(programm_day), null, 4);
        start();
    }

}



module.exports = {
    createPlaylist,
    get_command,
    createElement,
    send_message_manager,
    check_processes,
    preparationProgramm,

}