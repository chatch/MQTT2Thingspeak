'use strict'
let assert = require('assert')
let helpers = require('../lib/helpers')

describe('helpers', function () {
    describe('#msgToThingspeak', function () {
        it('should map message to thingspeak field defined in config', function () {
            let cfg = {
                channel: 111,
                field: 'field2'
            }
            let ts = helpers.msgToThingspeak(cfg, 'the msg')
            assert.equal(111, ts.channel)
            assert.equal(1, Object.keys(ts.fields).length)
            assert.equal('the msg', ts.fields.field2)
        })
    })

    describe('#msgCsvToThingspeak', function () {
        it('should map each csv field onto the correct thingspeak field', function () {
            let cfg = {
                type: 'csv',
                channel: 111,
                fields: {
                    1: 'field2',
                    2: 'field3'
                }
            }
            let ts = helpers.msgCsvToThingspeak(cfg, 'two,three,four')
            assert.equal(111, ts.channel)
            assert.equal(2, Object.keys(ts.fields).length)
            assert.equal('two', ts.fields.field2)
            assert.equal('three', ts.fields.field3)
        })
    })

})