const moment = require('moment-timezone');
moment.tz.setDefault('Europe/Kiev');

const os = require('os');
const fs = require("fs-extra");
const path = require('path');
const schedule = require('node-schedule');
const nodeCron = require("node-cron");


const all_notification = [];

// Замените на подходящие значения
const NOTIFICATION_TYPES = {
  WORK: "WORK",
  INTERVAL: "INTERVAL",
  FIX: "FIX",
  PLAYLISTS: "PLAYLISTS"
};

// Замените на подходящие значения
const TIMEZONE = "Europe/Kiev";

const OPTIONS = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'storage', 'options.json'), 'utf8'));
const { playlists, adv_fix, adv_interval } = OPTIONS;

const notifications = {
  [NOTIFICATION_TYPES.PLAYLISTS]: [],
  [NOTIFICATION_TYPES.WORK]: [OPTIONS.start_app, OPTIONS.stop_app],
  [NOTIFICATION_TYPES.INTERVAL]: [],
  [NOTIFICATION_TYPES.FIX]: []
};

if (playlists.length > 1) {
  for (const item of playlists) {
    const { time_start, time_stop } = item;
    if (!notifications[NOTIFICATION_TYPES.PLAYLISTS].includes(time_start)) {
      notifications[NOTIFICATION_TYPES.PLAYLISTS].push(time_start);
    }
    if (!notifications[NOTIFICATION_TYPES.PLAYLISTS].includes(time_stop)) {
      notifications[NOTIFICATION_TYPES.PLAYLISTS].push(time_stop);
    }
  }
}

try {
  if (adv_fix.length > 0) {
    for (const item of adv_fix) {
      notifications[NOTIFICATION_TYPES.FIX].push(item.fix);
    }
  }
} catch (error) {
  throw error;
}

try {
  if (adv_interval.length > 0) {
    for (const item of adv_interval) {
      if (!notifications[NOTIFICATION_TYPES.INTERVAL].includes(item.interval_t)) {
        notifications[NOTIFICATION_TYPES.INTERVAL].push(item.interval_t);
      }
    }
  }
} catch (error) {
  throw error;
}

try {
  console.log("START DELETE SCHEDULES");
  for (const jobName in schedule.scheduledJobs) {
    const job = schedule.scheduledJobs[jobName];
    job.cancel();
    console.log("DELETE SCHEDULES: " + jobName);
  }
} catch (error) {
  throw error;
}

const INTERVAL_LIST = [];

for (const [key, value] of Object.entries(notifications)) {
  if (key === NOTIFICATION_TYPES.INTERVAL) {
    for (const item of value) {
      addInterval(item);
    }
  } else {
    for (const item of value) {
      addTime(item, key);
    }
  }
}

function addInterval(min) {
  const minutes = parseInt(min);
  INTERVAL_LIST.push(minutes);
  const job = nodeCron.schedule(`*/${minutes} * * * *`, () => process.send({ type : 'process:notification_interval', data : { command: 'interval', 'minutes': minutes, 'info': NOTIFICATION_TYPES.INTERVAL}}), { timezone: TIMEZONE });
  console.log("interval: " + minutes)
}

function addTime(time, name) {
  const [hours, minutes, seconds] = time.split(':').map(Number);
  const cronExpression = `${seconds} ${minutes} ${hours} * * *`;
  const job = nodeCron.schedule(cronExpression, () => process.send({ type : 'process:notification_time', data : { command: name, time: time}}), { timezone: TIMEZONE });
  console.log(name + "===>" + time)
}
