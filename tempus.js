const moment = require('moment-timezone');
moment.tz.setDefault('Europe/Kiev');

module.exports.between = ((from, to, val = "null") => {


    if(val === "null") { val = moment(new Date(), 'HH:mm:ss') }
    else { val = moment(val, 'HH:mm:ss') }

    if (val >= moment(from, "HH:mm:ss") && val < moment(to, "HH:mm:ss")) {
        return true;
    }else{
        return false;
    }
});

module.exports.add_seconds = ((seconds, time = "null") => {

    let tm;
    if(time === "null") { tm = moment(new Date(), 'HH:mm:ss') }
    else { tm = moment(time, "HH:mm:ss") }

    const new_tm = tm.add(seconds, 's');

    return moment(new_tm, "HH:mm:ss");
})

module.exports.current_time = ((my_format = "HH:mm:ss") => { return moment().format(my_format) });
module.exports.current_date = ((my_format = "DD-MM-YYYY") => { return moment().format(my_format) })