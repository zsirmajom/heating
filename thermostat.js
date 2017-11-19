import { HeatingZone } from './heatingZone'

export class Thermostat {
    constructor() {
        const self = this;

        self.zones = [];
    }

    registerArea(config) {
        const self = this;

        self.zones.push(new hz.HeatingZone(config));
    }
    
    updateState() {
        const self = this;
        
        self.zones.forEach(zone => {
            zone.updateState();
        });
    }
};
