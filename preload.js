
const { ipcRenderer } = require('electron');

const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const homedir = path.join(os.homedir(), 'demon-84');
const __path_mod = path.join(homedir, '.managerDemon_84');
const { printContent } = require('./visual');
const AdmZip = require('adm-zip');
const { exec } = require('child_process');





document.addEventListener("DOMContentLoaded", () => {

    (() => {
        //check if general folder exist
        fs.access(path.join(homedir), fs.constants.F_OK, (error) => {
            if (error) {
                const installSpace_ = document.getElementById('info_space');
                installSpace_.innerHTML = '';
                try { ipcRenderer.send('show_window') }
                catch (error) { console.log(error) }
                finally {
                    fs.mkdirSync(path.join(os.homedir(), 'demon-84'), { recursive: true });
                    fs.mkdirSync(path.join(homedir, '.managerDemon_84'), { recursive: true });
                    fs.mkdirSync(path.join(homedir, 'work'), { recursive: true });
                    fs.mkdirSync(path.join(homedir, 'music'), { recursive: true });
                    fs.mkdirSync(path.join(homedir, 'adv'), { recursive: true });
                    fs.mkdirSync(path.join(homedir, 'logs'), { recursive: true });
                    fs.mkdirSync(path.join(homedir, 'configs'), { recursive: true });

                    createElement('p', 'row_0', 'p-info-install', installSpace_, "Preparation files & Install all dependencies");

                    setTimeout(() => { 
                        createElement('p', 'row_2', 'p-info-install', installSpace_, "Create all directories");
                        createElement('p', 'row_121', 'p-info-install', installSpace_, "Please wait...");
                    }, 5000);

                    (async () => {
                        try {
                                createElement('p', 'row_4', 'p-info-install', installSpace_, 'Extract modules...');
                                const extractDir = path.join(homedir, '.managerDemon_84');
                                const zipFilePath = path.join(__dirname, 'pkg_mod', 'app.zip');

                                // Создаем объект архива
                                const zip = new AdmZip(zipFilePath);

                                // Извлекаем все содержимое архива
                                zip.extractAllTo(extractDir, true)
                                
                                    exec('cd ' + __path_mod + ' && npm install', { encoding: 'utf-8' }, (error, stdout, stderr) => {
                                        if (error) { createElement('p', 'err', 'p-info-install', installSpace_, error) } 
                                        else {
                                            createElement('p', 'row_02', 'p-info-install', installSpace_, "All dependencies installed");
                                            setTimeout(() => { createElement('p', 'row_3', 'p-info-install', installSpace_, "Restart app & download content in hidden mode") }, 10000);
                                            setTimeout(() => { ipcRenderer.send('reload') }, 15000);                    
                                        }
                                    })
                               
                        } catch (error) { console.log(error) }
                    })();
                }
            }
        });
    })();

});




function createElement(tag, id, className = 'errorcode', parent, content = 'null') {

    const element = document.createElement(tag);
    element.id = id;
    element.className = className;
    parent.appendChild(element);

    if (content != 'null') { printContent(id, content) }
}


