"use strict";

var http = require('http');
var q = require('q');

function TemperatureSensor(url) {
    var self = this;
    
    self.url = url;
    self.lastValue = null;
    self.prellValue = null;
    self.prellCounter = 0;
}

TemperatureSensor.PRELL_LIMIT = 0.1;

exports.TemperatureSensor = TemperatureSensor;

TemperatureSensor.prototype.getValue = function() {
    var self = this;
    var value = null;
    var options = {
        host: self.url,
        path: '/Temperature'
    };

    var deferred = q.defer();

    var callback = function(response) {
        var str = '';

        response.on('data', function(chunk) {
            str += chunk;
        });

        response.on('end', function() {
            deferred.resolve(parseFloat(str));
        });
    }

    var request = http.request(options, callback);
 
    request.on('error', function(error) {
        deferred.reject(error);
    });

    request.end();
   
    return deferred.promise;
}

TemperatureSensor.prototype.handlePrell = function(newValue) {
    var self = this;
    
    if (self.lastValue == null) {
        self.lastValue = newValue;
    }
    
    if (self.prellValue == newValue) {
        self.lastValue = newValue;
    }
        
    if (self.lastValue == newValue) {
        return self.lastValue;
    }
    
    self.prellValue = newValue;
    return self.lastValue;
}
