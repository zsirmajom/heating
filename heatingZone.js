"use strict";

import { wiringPi as wpi } from 'wiring-pi';
import { q } from 'q';
import { TemperatureSensor } from './temperatureSensor';
import { ThingSpeakClient } from './thingSpeakClient';
import { notification } from './notification';

wpi.setup('wpi');

export class HeatingZone {
    static THRESHOLD = 0.3;
    static DAYLIGHT_START_HOUR = 7;
    static DAYLIGHT_END_HOUR = 22;

    constructor(config) { 
        const self = this;

        self._config = config; 
        self.dataSource = null;
        self.sensorValue = null;
        self.active = false;
        self.error = false;

        self.initDataSource();
        self.initRelayPins();
    }

    initDataSource() {
        const self = this;
        self.dataSource = new TemperatureSensor(self._config.sensorUrl);
    }

    initRelayPins() {
        const self = this;

        self._config.relayPins.forEach(pin => {
            wpi.pinMode(pin, wpi.OUTPUT);
            wpi.digitalWrite(pin, wpi.HIGH);
        });
    }
    
    updateState() {
        const self = this;

        self.source.getValue().then(sensorValue => {
            console.log(self._config.name, "sensor value: ", sensorValue);
            self.adjustOutputs(sensorValue);
    
            if (self.error) {
                notification.send(self._config.name, "Temperature sensor restored.");
                self.error = false;
            }
        }, error => {
            if (!self.error) {
                self.error = true;
                notification.send(self._config.name, "ERROR: Temperature sensor if offline.");
                self.heatingOff();
            }
            console.log('ERROR', error);
        });
    }
    
    setPinsOn() {
        this._config.relayPins.forEach(pin => { wpi.digitalWrite(pin, wpi.LOW); });
    }
    
    setPinsOff() {
        this._config.relayPins.forEach(pin => { wpi.digitalWrite(pin, wpi.HIGH); });
    }

    adjustOutputs(sensorValue) {
        const self = this;
        self.sensorValue = sensorValue;
        
        if (self.active && !self.boost && self.getDesiredTemperature() + HeatingZone.THRESHOLD < sensorValue) {
            self.heatingOff();
        } else if (!self.active && (self.boost || sensorValue < self.getDesiredTemperature() - HeatingZone.THRESHOLD)) {
            self.heatingOn();
        }
    };
    
    heatingOn() {
        const self = this;
    
        self.setPinsOn();
        self.active = true;

        console.log(self._config.name, "Heating ON");
        notification.send(self._config.name, message + "Heating ON, sensor value: " + self.sensorValue.toString());
    };
    
    heatingOff() {
        const self = this;
    
        self.setPinsOff();
        self.active = false;
        console.log(self._config.name, "Heating OFF");
        notification.send(self._config.name, "Heating OFF, sensor value: " + self.sensorValue.toString());
    };
    
    
    getDesiredTemperature() {
        const self = this;
        const hours = new Date().getHours();
        
        return (HeatingZone.DAYLIGHT_START_HOUR < hours && hours < HeatingZone.DAYLIGHT_END_HOUR
            ? self._config.daylight
            : self._config.night
        );
    };
}