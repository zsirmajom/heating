"use strict";

var fs = require('fs');
var config = JSON.parse(fs.readFileSync('settings.json', 'utf8'));
var async = require('async');
var ts = require("./thermostat.js");
var Thermostat = new ts.Thermostat();

config.areas.forEach(Thermostat.registerArea, Thermostat);

async.forever(function (next) {
    Thermostat.updateState();
    
    // call again in 10 seconds
    setTimeout(next, 10000);
}, function (error) {
    console.log(error);
});
