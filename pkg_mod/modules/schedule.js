// Description: Скрипт для планирования работы приложения
//version 3.0.5

const moment = require('moment');
const os = require('os');
const fs = require("fs");
const path = require('path');
const pm2 = require('pm2');
const MY_DATE = (val) => moment(new Date(val)).format('YYYY-MM-DD');



const PATH_CONFIG_FILE = path.join(__dirname, '..', 'storage', 'config.json');
const DATA_CLIENT = JSON.parse(fs.readFileSync(PATH_CONFIG_FILE));
const DATA_STATION = DATA_CLIENT.client_config[0];
const OPTIONS = {};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////


//график работы на текущий день
OPTIONS['start_app'] = DATA_STATION.start_work;
OPTIONS['stop_app'] = DATA_STATION.stop_work;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//формирование плейлистов для текущего дня
try {

  const PLAYLISTS = DATA_CLIENT.playlists;
    const PLAYLISTS_TODAY = PLAYLISTS.filter(key => moment().isBetween(MY_DATE(key.date_start), MY_DATE(key.date_stop), null, '[]'));
    OPTIONS['playlists'] = PLAYLISTS_TODAY;
  

} catch (error) { throw error }

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// Формирование списка музыкальных файлов на текущий день
let ALL_MUSIC = DATA_CLIENT.all_music;

// Проверка структуры массива ALL_MUSIC и объединение вложенных массивов в один
if (ALL_MUSIC.length > 0 && Array.isArray(ALL_MUSIC[0])) { ALL_MUSIC = [].concat(...ALL_MUSIC) }

// Сортировка музыки для текущего дня
OPTIONS['all_music_today'] = [];
try {
  for (key of Object.keys(OPTIONS.playlists)) {

    const playlist = OPTIONS.playlists[key];
    const id_playlist = playlist.id_playlist;
    const start_time = playlist.time_start;
    const stop_time = playlist.time_stop;
    const name_playlist = playlist.name_playlist;

    for (const music of ALL_MUSIC) {
      if (id_playlist === music.id_playlist) {

        music.time_start = start_time;
        music.time_stop = stop_time;
        music.name_playlist = name_playlist;
        music.full_name = `${music.artist}-${music.name_song}.mp3`;

        OPTIONS.all_music_today.push(music);
      }
    }
  }

} catch (error) { throw error }

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Формирование списка рекламы на текущий день
try {

  const LIST_ADV = DATA_CLIENT.all_adv;

  if (LIST_ADV.length > 0) {
    const ADV_TODAY = LIST_ADV.filter(key => moment().isBetween(MY_DATE(key.date_start), MY_DATE(key.date_stop), null, '[]'));
    // Сортировка актуальной рекламы по типу (fix, interval_t)
    OPTIONS['adv_fix'] = ADV_TODAY.filter(key => key.type === 'fix');
    OPTIONS['adv_interval'] = ADV_TODAY.filter(key => key.type === 'interval_t');
    //OPTIONS['adv_interval'].sort((a, b) => a.interval - b.interval);

  } else { OPTIONS['adv_fix'] = []; OPTIONS['adv_interval'] = [] }  /*????????????????????????????????*/

}
catch (error) { throw error }

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////





fs.writeFileSync(path.join(__dirname, '..', 'storage', 'options.json'), JSON.stringify(OPTIONS, null, 2));
fs.writeFileSync(path.join(os.homedir(), 'demon-84', 'configs', 'options.json'), JSON.stringify(OPTIONS, null, 2));
fs.writeFileSync(path.join(__dirname, '..', 'commands', 'download_songs.json'), JSON.stringify({ command: "start_download_songs" }), null, 4);
fs.writeFileSync(path.join(__dirname, '..', 'commands', 'download_adv.json'), JSON.stringify({ command: "start_download_adv" }), null, 4);
pm2.connect(() => { pm2.restart('NOTIFICATION') })




process.exit();
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
