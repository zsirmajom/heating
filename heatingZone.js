"use strict";

var wpi = require("wiring-pi");
var temp = require("./temperatureSensor");
var notification = require("./notification.js");

wpi.setup('wpi');

function HeatingZone(config) {
    var self = this;
    self._config = config;
    self.sensorValue = null;
    
    this.sensor = new temp.TemperatureSensor(config.sensorUrl);
    this.active = false;
    this.error = false;
    this.boost = false;
    this.boostTimout = null;
    
    self._config.relayPins.forEach(function(pin) {
        wpi.pinMode(pin, wpi.OUTPUT);
        wpi.digitalWrite(pin, wpi.HIGH);
    });
};

HeatingZone.THRESHOLD = 0.3;

exports.HeatingZone = HeatingZone;

HeatingZone.prototype.updateState = function() {
    var self = this;
    self.sensor.getValue().then(function(sensorValue) {
        console.log(self._config.name, "sensor value: ", sensorValue);
        self.adjustOutputs(sensorValue);

	if (self.error) {
            notification.send(self._config.name, "Temperature sensor restored.");
            self.error = false;
        }
    }, function(error) {
        if (!self.error) {
            self.error = true;
            notification.send("Error", "Temperature sensor if offline. (" + self._config.name + ")");
            self.heatingOff();
        }
        console.log('ERROR', error);
    });
};

HeatingZone.prototype.adjustOutputs = function(sensorValue) {
    var self = this;
    self.sensorValue = sensorValue;
    
    if (self.active && !self.boost && self.getDesiredTemperature() + HeatingZone.THRESHOLD < sensorValue) {
	self.heatingOff();
    } else if (!self.active && (self.boost || sensorValue < self.getDesiredTemperature() - HeatingZone.THRESHOLD)) {
	self.heatingOn();
    }
};

HeatingZone.prototype.heatingOn = function() {
    var self = this,
        message = "";

    self.setPinsOn();
    self.active = true;

    message = (self.boost
        ? "Boost Heating"
        : "Heating ON"
    );
    console.log("Heating ON");
    notification.send(self._config.name, message + ", sensor value: " + self.sensorValue.toString());
};

HeatingZone.prototype.heatingOff = function() {
    var self = this;

    self.setPinsOff();
    self.active = false;
    console.log("Heating OFF");
    notification.send(self._config.name, "Heating OFF, sensor value: " + self.sensorValue.toString());
};


HeatingZone.prototype.getDesiredTemperature = function() {
    var self = this;
    var hours = new Date().getHours();
    var temp = (7 < hours && hours < 22
        ? self._config.daylight
        : self._config.night
    );

    return temp;
};

HeatingZone.prototype.boost = function() {
    var self = this;

    self.clearBoost();

    self.boostTimeout(clearBoost, 3600);
};

HeatingZone.prototype.clearBoost = function() {
    var self = this;
 
    clearTimeout(self.boostTimeout);
    self.boost = false;
};

HeatingZone.prototype.setPinsOn = function() {
    var self = this;

    self._config.relayPins.forEach(function(pin) {
        wpi.digitalWrite(pin, wpi.LOW);
    });
};

HeatingZone.prototype.setPinsOff = function() {
    var self = this;

    self._config.relayPins.forEach(function(pin) {
        wpi.digitalWrite(pin, wpi.HIGH);
    });
};
