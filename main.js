//v3.0.5


const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
const squirrelStartup = require('electron-squirrel-startup');

// Проверка наличия Squirrel-инсталлятора
if (squirrelStartup) {
  app.quit();
}



function createWindow() {

  const playerWindow = new BrowserWindow({
    width: 1920,
    height: 300,
    frame: true,
    show: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      preload: path.join(__dirname, 'preload.js')
    }

  })

  playerWindow.setPosition(0, 0);
  playerWindow.loadFile('./player.html');
  //playerWindow.webContents.openDevTools();

  const reload_station = () => { playerWindow.reload() }

  ipcMain.on('reload', () => { app.relaunch(); app.exit(0); });
  ipcMain.on('show_window', () => { playerWindow.show() });
  ipcMain.on('minimize_window', () => { playerWindow.minimize() });
  ipcMain.on('quit_app', () => { app.quit() });
  

}




app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  });

  const template = [
    {
      label: 'Menu',
      submenu: [
        { role: 'about' },
        { role: 'forcereload' },
        { role: 'toggledevtools' },
        { role: 'minimize' }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)


})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

ipcMain.on('app:quit', (event, arg) => {
  app.quit();
});

  if (app.isPackaged) {
    app.setLoginItemSettings({
      openAtLogin: true,
      path: process.execPath,
    });
  }
