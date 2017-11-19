import { fs } from 'fs';
import { async } from 'async';
import { Thermostat } from './thermostat'

const REPEAT_INTERVAL = 60000,
    config = JSON.parse(fs.readFileSync('settings.json', 'utf8')),
    Thermostat = new Thermostat();

config.areas.forEach(Thermostat.registerArea, Thermostat);

async.forever(next => {
    Thermostat.updateState();
    
    setTimeout(next, REPEAT_INTERVAL);
}, error => { 
    console.log(error); 
});
