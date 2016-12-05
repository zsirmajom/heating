"use strict";

var hz = require("./heatingZone");

function Thermostat() {
    this.zones = [];
};

exports.Thermostat = Thermostat;

Thermostat.prototype.registerArea = function(config) {
    this.zones.push(new hz.HeatingZone(config));
}

Thermostat.prototype.updateState = function() {
    var self = this;
    
    self.zones.forEach(function (zone) {
        zone.updateState();
    });
}
