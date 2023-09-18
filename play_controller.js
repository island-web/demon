
const path = require('path');
const chokidar = require('chokidar');



const content = document.getElementById('content');
const interval = document.getElementById('interval');


const __path_content = path.join(os.homedir(), 'demon-84', 'music');
const volume_content = 0.7;

const buffer = [];
let canPlay = true;


//handler command from other processes
const filePathWatcher = path.join(__dirname, 'eventsController.json');
const watcher = chokidar.watch(filePathWatcher);
watcher.on('error', (error) => { console.error(`Ошибка при отслеживании файла: ${error}`) });


//functions
// Функция для перемешивания массива
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

function fade_out() {
    return new Promise((resolve, reject) => {
        const fadeInterval = setInterval(() => {
            if (content.volume > 0.1) {
                content.volume -= 0.1;
            } else {
                content.volume = 0;
                clearInterval(fadeInterval);
                resolve();
            }
        }, 1000);
    });
}


function fade_in() {
    content.play();
    const interval = setInterval(() => {
        if (content.volume < volume_content) { content.volume += 0.1 }
        else {
            content.volume = volume_content;
            clearInterval(interval);
        }
    }, 1000);
}


const fixConflict = (start_play, end_play) => {
    const fixed_list = JSON.parse(fs.readFileSync(path.join(os.homedir(), 'demon-84', '.managerDemon_84', 'storage', 'options.json')), 'utf-8').adv_fix;
    for(f of fixed_list) { 
        if(tempus.between(start_play, end_play, f.fix)) {
            buffer.push(...data.playlist);
            return true;
        }
    }
    return false;
}

watcher.on('change', () => { 

    const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'eventsController.json')), 'utf-8');

    switch(data.command){

        case 'play_interval':
            
            if(buffer.length > 0 || !canPlay){ buffer.push(...data.playlist) } 
            else {
                canPlay = false;
                const opt = { all_duration: 0, start_play: null, end_play: null }
                for(obj of data.playlist) { opt.all_duration += obj.duration }
                opt.start_play = tempus.current_time();
                opt.end_play = tempus.add_seconds(opt.all_duration, opt.start_play);

                if(fixConflict(opt.start_play, opt.end_play)) { buffer.push(...data.playlist); canPlay = true }
                else { fade_out().then(() => { playInterval(data.playlist) })}
            }

        break;

    }
});

//******************************************************************************************************************************************** */
                                                                        /*MODULES*/
//******************************************************************************************************************************************** */


module.exports.start = async () => {

    fs.writeFileSync(path.join(manager_command), JSON.stringify({ command: 'player_log', log: 'Запуск аудіо' }));
    
    const actual_programm = JSON.parse(fs.readFileSync(path.join(__dirname, 'programm_day.json')));



    shuffleArray(actual_programm.playlist);
    const playlist = await actual_programm.playlist;

    playContent(playlist);
    

    

    






};




function playContent(current_playlist){

    let song_index = 0;
    content.src = path.join(__path_content, current_playlist[song_index].full_name)
    content.volume = volume_content;
    content.play();
    fs.writeFileSync(path.join(manager_command), JSON.stringify({ command: 'player_log', log: 'Старт плей: ' + current_playlist[song_index].full_name }));

   content.onplay = () => {
    createElement('p', tempus.current_time('mm:ss'), 'p-info-content', info_space, `
    [ ${tempus.current_time()} ] ===> PLAY NOW: ${current_playlist[song_index].full_name}
    .....time work album: ${current_playlist[song_index].time_start} - ${current_playlist[song_index].time_stop}
    `);
    }

    content.onerror = () => {
        console.log('error');
        song_index++;
        if (song_index >= current_playlist.length) {
            song_index = 0;
            shuffleArray(current_playlist);
        }
        content.src = path.join(__path_content, current_playlist[song_index].full_name);
        content.play();
        fs.writeFileSync(path.join(manager_command), JSON.stringify({ command: 'player_log', log: 'Старт плей: ' + current_playlist[song_index].full_name }));

    }

    content.onended = () => {
        song_index++;
        if (song_index >= current_playlist.length) {
            song_index = 0;
            shuffleArray(current_playlist);
        }
        content.src = path.join(__path_content, current_playlist[song_index].full_name);
        content.play();
        fs.writeFileSync(path.join(manager_command), JSON.stringify({ command: 'player_log', log: 'Старт плей: ' + current_playlist[song_index].full_name }));

    }
}





const playInterval = (current_playlist) => {

    let counter_interval = 0;

    interval.src = path.join(os.homedir(), 'demon-84', 'adv', current_playlist[counter_interval].name_adv);
    interval.volume = current_playlist[counter_interval].volume / 100;
    interval.play();
    fs.writeFileSync(path.join(manager_command), JSON.stringify({ command: 'player_log_adv', log: 'Старт реклами ( інтервал ): ' + current_playlist[counter_interval].name_adv }));

    
    interval.onplay = () => {
        createElement('p', tempus.current_time('mm:ss'), 'p-info-interval', info_space, `[ ${tempus.current_time()} ] ===> PLAY NOW: ${current_playlist[counter_interval].name_adv}`);
    }

    interval.onerror = () => {
        console.log('error');
        counter_interval++;
        if (counter_interval < current_playlist.length) {
            interval.src = path.join(os.homedir(), 'demon-84', 'adv', current_playlist[counter_interval].name_adv);
            interval.volume = current_playlist[counter_interval].volume / 100;
            interval.play();
            fs.writeFileSync(path.join(manager_command), JSON.stringify({ command: 'player_log_adv', log: 'Старт реклами ( інтервал ): ' + current_playlist[counter_interval].name_adv }));
        }
    }

    interval.onended = () => {
        counter_interval++;
        if(counter_interval < current_playlist.length) {
            interval.src = path.join(os.homedir(), 'demon-84', 'adv', current_playlist[counter_interval].name_adv);
            interval.volume = current_playlist[counter_interval].volume / 100;
            interval.play();
            fs.writeFileSync(path.join(manager_command), JSON.stringify({ command: 'player_log_adv', log: 'Старт реклами ( інтервал ): ' + current_playlist[counter_interval].name_adv }));
        }else{
            canPlay = true;
            interval.src = '';
            fade_in();
        }
    }

}












