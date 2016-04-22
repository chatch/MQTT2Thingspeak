'use strict';

let mqtt = require('mqtt'),
    ThingSpeakClient = require('thingspeakclient'),
    fs = require('fs'),
    yaml = require('js-yaml'),
    helpers = require('./lib/helpers');

const CONFIG = yaml.load(fs.readFileSync('config.yml', 'utf8')),
    TOPICS = CONFIG.topics;

//
// Environment variable overrides
//
let envOrCfg = function (envVar, cfgVal) {
    return process.env[envVar] ? process.env[envVar] : cfgVal;
}
const MQTT_HOST = envOrCfg('MQTT_HOST', CONFIG.mqtt.broker.host);
const MQTT_PORT = envOrCfg('MQTT_PORT', CONFIG.mqtt.broker.port);

//
// Setup the MQTT client
//
let mqOpts = {
    host: MQTT_HOST,
    port: MQTT_PORT
};
let mqClient = mqtt.connect(mqOpts);

mqClient.on('error', function (err) {
    console.error('mqtt error: ' + err);
});

mqClient.on('connect', function () {
    console.log('Connected to broker ' + MQTT_HOST);
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
    let topicCfg = TOPICS[topic];
    let tsRec;
    if (topicCfg.type && topicCfg.type == 'csv')
        tsRec = helpers.msgCsvToThingspeak(topicCfg, message);
    else
        tsRec = helpers.msgToThingspeak(topicCfg, message);
    writeThingspeak(tsRec.channel, tsRec.fields);
});

function writeThingspeak(channel, fields) {
    console.log(channel + ':' + fields)
    tsClient.updateChannel(channel, fields, function (err, resp) {
        if (!err && resp > 0) {
            console.log('update successfully. Entry number was: ' + resp);
        } else if (err) {
            console.error('update failed. Error: ' + err);
        }
    });
}