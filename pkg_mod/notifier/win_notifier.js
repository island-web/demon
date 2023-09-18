const notifier = require('node-notifier');
const path = require('path');




const pathToDeffIco = path.join(__dirname, 'icon.png');
const version = require(path.join(__dirname, '..', 'package.json')).version;



function notification(title_text, mes){
    try {
        notifier.notify({
            title: `TMM [ ${title_text} ]`,
            message: mes,
            icon: pathToDeffIco,
            sound: true,
            wait: true,
            timeout: 20
        });
    }
    
    catch (err) { console.log(err); }
}







module.exports = {
    notification
}