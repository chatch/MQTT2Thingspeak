'use strict';

let mqtt = require('mqtt'),
    ThingSpeakClient = require('thingspeakclient'),
    fs = require('fs'),
    yaml = require('js-yaml');

const CONFIG = yaml.load(fs.readFileSync('config.yml', 'utf8')),
    TOPICS = CONFIG.topics;

//
// Setup the MQTT client
//
let mqOpts = {
    host: CONFIG.mqtt.host,
    port: CONFIG.mqtt.port
};
let mqClient = mqtt.connect(mqOpts);

mqClient.on('error', function (err) {
    console.error('mqtt error: ' + err);
});

mqClient.on('connect', function () {
    console.log('Connected to broker');
});

//
// Setup the Thingspeak client
//
let tsClient = new ThingSpeakClient();

let channels = CONFIG.thingspeak.channels;
for (let channel in channels) {
    tsClient.attachChannel(parseInt(channel), {
        writeKey: channels[channel].write_key
    }, function (err) {
        if (err)
            console.error('failed to attach: ' + err);
    });
}

//
// Subscribe to all configured topics
//
for (let topic in TOPICS) {
    console.log('Subscribing to ' + topic);
    mqClient.subscribe(topic);
}

mqClient.on('message', function (topic, message) {
    console.log(topic + ": '" + message + "'");
    let tsChannel = TOPICS[topic].channel;
    let tsField = TOPICS[topic].field;
    writeThingspeak(tsClient, tsChannel, tsField, message);
});

function writeThingspeak(tsClient, tsChannel, tsField, message) {
    let fields = {};
    fields[tsField] = message;
    tsClient.updateChannel(tsChannel, fields, function (err, resp) {
        if (!err && resp > 0) {
            console.log('update successfully. Entry number was: ' + resp);
        } else if (err) {
            console.error('update failed. Error: ' + err);
        }
    });
}