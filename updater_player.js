//v3.0.3 update_player.js


const fs = require('fs-extra');
const os = require('os');
const path = require('path');
const Downloader = require('nodejs-file-downloader');
const AdmZip = require('adm-zip');
const pm2 = require('pm2');
const remoteServer = 'https://web-island.space/';
const myPath = path.join(__dirname);



(async () => {
    console.log('Downloading update file');
    const pathUpdateFile = path.join(remoteServer, 'control_version', 'clients', os.platform(), os.arch(), 'player.zip');
    
    try {
        const downloader = new Downloader({ url: pathUpdateFile, directory: myPath });
        const { filePath, downloadStatus } = await downloader.download();
    } catch (error) { console.error('Error downloading update file:', error.message) }
    finally { console.log('Downloaded update file'); extractApp() }
})();



async function extractApp() {
    console.log('Extracting update file');
    try {
        const zipFilePath = path.join(__dirname, 'player.zip');
        const zip =  new AdmZip(zipFilePath);
        zip.extractAllTo(myPath, true);
    } catch (error) { console.error(myPath, 'Error extracting update file:', error.message) }
    finally { console.log('Zip extract ok'); deleteFileZip() }
}

async function deleteFileZip(){

    const zipFilePath = path.join(__dirname, 'player.zip');
    fs.unlinkSync(zipFilePath);
    console.log('Zip deleted');
    reloadApp();
}

async function reloadApp(){
    const filePathWatcher = path.join(os.homedir(), 'demon-84', '.managerDemon_84', 'commands', 'player.json');

    pm2.connect(function (err) {
        if (err) { console.error(err); process.exit(2) }
        pm2.delete('all', () => {
            pm2.disconnect();
        });
        fs.writeFileSync(filePathWatcher, JSON.stringify({ command: 'reload', message: 'Reload update' }));
    });
}