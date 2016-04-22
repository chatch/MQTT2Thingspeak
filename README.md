# mqtt2thingspeak
Subscribes to MQTT topics and pushes messages to Thingspeak channel fields based on a map of topic to channel/feed.

Define map of topics to channel/field combinations in config.yml:

```
mqtt:
  broker:
    host: 172.17.0.2
    port: 1883

thingspeak:
  channels:
    11111:
      write_key: 'xxxxxxxxxxxxxxxx'

topics:
  /air/1/pm2.5:
    channel: 11111
    field: field1
  /air/1/pm10:
    channel: 11111
    field: field2
  /air/1/pm/csv:
    type: csv
    channel: 11111
    fields:
      1: field1
      2: field2
```
