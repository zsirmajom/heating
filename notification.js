"use strict";

var fs = require('fs');
var config = JSON.parse(fs.readFileSync('notificationSettings.json', 'utf8'));
var push = require('pushover-notifications');

exports.send = function(title, message) {
    var p = new push({
        user: config.user,
        token: config.token,
    });

    var msg = {
        message: message,
        title: title,
	priority: 1
    }

    p.send(msg, function(error, result) {
        if (error) {
            throw error;
        }

        console.log(result);
    });
};
