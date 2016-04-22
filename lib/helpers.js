'use strict'

let csvparse = require('csv-parse/lib/sync')

// parse an mqtt message that maps directly on to a single thingspeak field
function msgToThingspeak(topicCfg, message) {
    let tsRec = {
        channel: topicCfg.channel,
        fields: {}
    }
    tsRec.fields[topicCfg.field] = message
    return tsRec
}

// parse an mqtt message that is a csv string.
// 
// mappings from csv field number to thingspeak field name must be defined in config 
// under 'fields' for the topic. For example: 
//
//  /air/2/pm/csv:
//    type: csv
//    channel: 98300
//    fields:
//      1: field1
//      2: field2
function msgCsvToThingspeak(topicCfg, message) {
    let csvVals = csvparse(message)
    let tsRec = {
        channel: topicCfg.channel,
        fields: {}
    }
    for (let csvFieldNum in topicCfg.fields) {
        let tsField = topicCfg.fields[csvFieldNum]
        tsRec.fields[tsField] = csvVals[0][csvFieldNum - 1]
    }
    return tsRec
}

module.exports.msgToThingspeak = msgToThingspeak
module.exports.msgCsvToThingspeak = msgCsvToThingspeak