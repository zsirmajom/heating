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
    wpi.pinMode(self._config.relayPin, wpi.OUTPUT);
    wpi.digitalWrite(self._config.relayPin, wpi.HIGH);
};

HeatingZone.THRESHOLD = 0.3;

exports.HeatingZone = HeatingZone;

HeatingZone.prototype.updateState = function() {
    var self = this;
    self.sensor.getValue().then(function(sensorValue) {
        console.log("SensorValue: ", sensorValue);
        self.adjustOutputs(sensorValue);
        self.error = false;
    }, function(error) {
        if (!self.error) {
            self.error = true;
            notification.send("Error", "Temperature sensor if offline. (" + self._config.name + ")");
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
        message = "";;

    wpi.digitalWrite(self._config.relayPin, wpi.LOW);
    self.active = true;

    message = (self.boost
        ? "Boost Heating"
        : "Heating ON"
    );

    notification.send("Status", message + ", sensor value: " + self.sensorValue.toString());
};

HeatingZone.prototype.heatingOff = function() {
    var self = this;

    wpi.digitalWrite(self._config.relayPin, wpi.HIGH);
    self.active = false;
    notification.send("Status", "Heating OFF, sensor value: " + self.sensorValue.toString());
};


HeatingZone.prototype.getDesiredTemperature = function() {
    var self = this;
    var hours = new Date().getHours();

    return (7 < hours && hours < 22
        ? self._config.daytime
        : self._config.night
    );
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
