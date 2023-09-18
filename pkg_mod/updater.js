//v3.0.3


const fs = require('fs-extra');
const os = require('os');
const path = require('path');
const chokidar = require('chokidar');
const Downloader = require('nodejs-file-downloader');
const AdmZip = require('adm-zip');
const pm2 = require('pm2');
const { exec } = require('child_process');
const { stderr, stdout } = require('process');

const remoteServer = 'https://web-island.space/';

const homeDir = os.homedir();
const appDir = path.join(homeDir, 'demon-84', '.managerDemon_84');
const storageDir = path.join(appDir, 'storage');
const commandsDir = path.join(appDir, 'commands');

const infoPlayer = JSON.parse(fs.readFileSync(path.join(storageDir, 'player_info.json'), 'utf-8'));

async function appUpdater() {
    console.log('Downloading update file for processor');
    const dataPlayer = infoPlayer;
    const pathUpdateFile = path.join(
        remoteServer,
        'control_version',
        'clients',
        dataPlayer.platform,
        dataPlayer.arch,
        'processor.zip'
    );

    try {
        const downloader = new Downloader({ url: pathUpdateFile, directory: appDir });
        const { filePath, downloadStatus } = await downloader.download();
    } catch (error) { console.error('Error downloading update file:', error.message) }
    finally {
        console.log('Downloaded update file');
        extractApp();
    }
}

async function extractApp() {
    console.log('Extracting update file');
    try {
        const zipFilePath = path.join(appDir, 'processor.zip');
        const zip = new AdmZip(zipFilePath);
        zip.extractAllTo(appDir, true);
    } catch (error) { console.error('Error extracting update file:', error.message) }
    finally {
        console.log('Extracted update file and deleted update zip file');
        fs.unlinkSync(path.join(appDir, 'processor.zip'));
        console.error(`Старт обновления плеера`);
        exec('node ' + path.join(infoPlayer.pathPlayer, 'updater_player.js'), (error, stderr, stdout) => {
            if (error) { console.error(`exec error: ${error}`); return } 
            console.log(stderr);
            console.log(stdout);
        });
        fs.writeFileSync(path.join(commandsDir, 'player.json'), JSON.stringify({ command: 'update' }));
    }
}


const filePath = path.join(commandsDir, 'updater.json');
const watcher = chokidar.watch(filePath);
watcher.on('change', () => {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    if (data.command === 'update' && data.version !== infoPlayer.version) {
        console.log('Updating to version:', data.version);
        appUpdater();
    } else {
        console.log('Version of the app is current:', infoPlayer.version);
    }
});


