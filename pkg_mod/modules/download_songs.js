const path = require('path');
const fs = require('fs').promises;
const os = require('os');
const chokidar = require('chokidar');
const Downloader = require("nodejs-file-downloader");

const MY_HOST = 'https://infiniti-pro.com/';
const PATH_CONFIG_FILE = path.join(os.homedir(), 'demon-84', '.managerDemon_84', 'storage', 'config.json');
const PATH_MUSIC = path.join(os.homedir(), 'demon-84', 'music');

function send_msg_to_manager(msg = 'default', com = 'default') { process.send({ type :"process:download_songs", data : { command: com, message: msg, name: 'TMM [ downloader ]'} }) }

const counter = {
    error_download_songs: 0
}

async function main() {
    try {
        const configData = await fs.readFile(PATH_CONFIG_FILE, 'utf8');
        const DATA_CLIENT = JSON.parse(configData);
        const ALL_MUSIC = DATA_CLIENT.all_music;


        const missingSongs = await checkMissingSongs(ALL_MUSIC);
        if (missingSongs.length > 0) { await downloadSongs(missingSongs) }
        
    } catch (error) { console.error('Error: start download songs' + error) }
}

async function checkMissingSongs(all_music) {
    const missingSongs = [];

    for (const key of Object.keys(all_music)) {
        const songPath = path.join(PATH_MUSIC, `${all_music[key].artist}-${all_music[key].name_song}.mp3`);

        try { await fs.access(songPath) }
        catch (error) { missingSongs.push(`${all_music[key].artist}-${all_music[key].name_song}.mp3`) }
    }

    return missingSongs;
}


const downloadSongs = async (songs) => {
    process.send({ type :"process:download_songs", data : { command: 'info_download_songs', message: "Розпочато завантаження музичного контенту", name: 'TMM [ downloader ]'} })

    let count_songs_downloaded = 0;
    
    while (count_songs_downloaded < songs.length) {
    
        const path_file = path.join(MY_HOST, 'music', songs[count_songs_downloaded]);
        console.log('START DOWNLOAD SONG:', songs[count_songs_downloaded]);

        try {
            const downloader = await new Downloader({ url: path_file, directory: PATH_MUSIC });
            const { filePath, downloadStatus } = await downloader.download();
            console.log('END DOWNLOAD SONG:', songs[count_songs_downloaded]);
            process.send({ type :"process:download_songs", data : { command: 'info_download_songs', message: `Завантаження: ${songs[count_songs_downloaded]}`, name: 'TMM [ downloader ]'} })
            count_songs_downloaded++;
            
        }
        catch (error) {
            console.error('Error downloading song:', songs[count_songs_downloaded], error);
            counter.error_download_songs++;
        }

    }

    process.send({ type :"process:end_download_songs", data : { command: 'end_download_songs', name: 'TMM [ downloader ]'} });
    return;
}


main();

//handler command from other processes
const filePathWatcher = path.join(os.homedir(), 'demon-84', '.managerDemon_84', 'commands', 'download_songs.json');
const watcher = chokidar.watch(filePathWatcher);
watcher.on('change', (path) => { get_command() });
watcher.on('error', (error) => { console.error(`Ошибка при отслеживании файла: ${error}`) });


function get_command() {
    fs.readFile(filePathWatcher, 'utf8')
        .then((data) => {
            const command = JSON.parse(data);
            if (command.command === 'start_download_songs') { main() }
        })
        .catch((error) => { console.error(`Ошибка при чтении файла: ${error}`) })
}