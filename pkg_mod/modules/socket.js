//name: SOCKET
const processName = "server manager";



const io = require('socket.io-client');
const path = require('path');
const fs = require('fs-extra');
const host = 'http://web-island.space';
const port = 3030;
const chokidar = require('chokidar');
const os = require('os'); 
const homedir = os.homedir();


const user = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'storage', 'passport.json'), 'utf8'));
const data_connect = { id: user.id, name: user.name, room: user.room, id_room: user.id_room, info: fs.readFileSync(path.join(__dirname, '..', 'storage', 'info_machine.json'), 'utf8') };
const socket = io(`${host}:${port}`, { auth: { room: user.room, data: data_connect } });

//get version from package.json
const version = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8')).version;

//require modules
const tempus = require('./tempus');


//sender message to manager process
function send_msg(com, msg, type = 'process:deffault'){ 
  console.log(type);
  process.send({ type : type, data : { name: processName, command: com, message: msg } }) 
}





//handler command from other processes
const filePathWatcher = path.join(homedir, 'demon-84', '.managerDemon_84', 'commands', 'socket_command.json');
const watcher = chokidar.watch(filePathWatcher);
watcher.on('change', (path) => { get_command() });
watcher.on('error', (error) => { console.error(`Ошибка при отслеживании файла: ${error}`) });



//work with server
socket.on("connect_error", (error) => {console.log(error); send_msg("error_connect", error, 'process:error') });
socket.on("disconnect", () => { send_msg("disconnect", 'null', 'process:command') });
socket.on("connect_timeout", (timeout) => { send_msg("timeout", timeout, 'process:command') });
socket.on("reconnect", (attempt) => { send_msg("reconnect", attempt, 'process:command') });


socket.on("connect", () => { 
  
  process.send({ type: "process:desktop", data: { name: processName, message: "connect to server successful"} }); 
  socket.emit('config'); 
  setTimeout(() => { socket.emit('client_version', version) }, 10000);

});


socket.on("config", (conf) => { 
  try { 
    fs.writeFileSync(path.join(__dirname, '..', 'storage', 'config.json'), JSON.stringify(conf));
    const data = { id_client: user.id, body: 'Клієнт підключен до сервера успішно. Конфігурація станції збережена', type: 'success', date: new Date(), time: new Date().getTime()};
    socket.emit('log_from_client', data);
    process.send({ type: 'process:command', data: {command: 'config_ok', name: processName, message: 'Конфігурація станції збережена'} })
  } 
  catch (error) { send_msg("config_save_connect", error, 'process:error') }
});

socket.on("update_version_po", (version) => { 
  const send = { command: 'update', version: version };
  fs.writeFileSync(path.join(homedir, 'demon-84', '.managerDemon_84', 'commands', 'updater.json'), JSON.stringify(send));
});




function get_command() {

  fs.readFile(filePathWatcher, 'utf8')
  .then((data) => {
    console.log(data);
      const info_from_player = JSON.parse(data);
      switch(info_from_player.command){
        case 'log_from_client':
          const data_send = { id_client: user.id, body: info_from_player.body, type: info_from_player.type, date: tempus.current_date(), time: tempus.current_time() };
          socket.emit('log_from_client', data_send);
          console.log(data_send);
        break;



        default: break;
      }
  })
  .catch((error) => { console.error(`Ошибка при чтении файла: ${error}`) })
}
