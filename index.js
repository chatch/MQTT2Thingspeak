"use strict";

let mqtt = require('mqtt'),
    ThingSpeakClient = require('thingspeakclient');

const MQTT_HOST = process.env.MQTT_HOST,
    MQTT_TOPIC = process.env.MQTT_TOPIC,
    THINGSPEAK_WRITE_KEY = process.env.THINGSPEAK_WRITE_KEY,
    THINGSPEAK_CHANNEL = parseInt(process.env.THINGSPEAK_CHANNEL);

function writeThingspeak(tsClient, fields) {
    tsClient.updateChannel(THINGSPEAK_CHANNEL, fields, function (err, resp) {
        if (!err && resp > 0) {
            console.log('update successfully. Entry number was: ' + resp);
        } else if (err) {
            console.error('update failed. Error: ' + err);
        }
    });
}

if (isNaN(THINGSPEAK_CHANNEL)) {
    console.error('thingspeak channel not a number');
    process.exit(-1);
}

let mqClient = mqtt.connect('mqtt://' + MQTT_HOST);

mqClient.on('error', function (err) {
    console.error('mqtt error: ' + err);
});

mqClient.on('connect', function () {
    console.log('Connected to broker ' + MQTT_HOST);
});

let tsClient = new ThingSpeakClient();
tsClient.attachChannel(THINGSPEAK_CHANNEL, {
    writeKey: THINGSPEAK_WRITE_KEY
}, function (err) {
    if (err) {
        console.error('failed to attach: ' + err);
    }
});

console.log('Subscribing to ' + MQTT_TOPIC);
mqClient.subscribe(MQTT_TOPIC);
mqClient.on('message', function (topic, message) {
    console.log(topic + ": '" + message + "'");
    writeThingspeak(tsClient, {
        "field1": message
    });
});