'use strict';

const
  async = require('async'),
  AbstractStep = require('./AbstractStep');

/**
 * This step sends real-time messages to kuzzle and measure
 * its response time.
 *
 * Used as a control step to get base measures.
 */
class RealtimeGeofencingStep extends AbstractStep {
  constructor(reporter, buffer, config) {
    super(reporter, buffer, config, 'RealtimeGeofencingStep', 'Geopolygon subscriptions listening to geopoints in the US');

    this.rooms = [];
  }

  run(callback) {
    super.run();
    this.subscribe(err => {
      if (err) {
        return callback(err);
      }

      const fn = (client, doc, cb) => {
        // filter notifications
        client.benchmarkListener = payload => {
          if (payload.result && payload.result.published) {
            cb(payload);
          }
        };

        client.send(JSON.stringify({
          index: this.config.kuzzle.index,
          collection: this.config.kuzzle.collection,
          controller: 'realtime',
          action: 'publish',
          body: doc
        }));
      };

      this.benchmark(fn, callback);
    });
  }

  subscribe(callback) {
    const
      start = Date.now(),
      currySubscribe = client => {
        return cb => {
          client.benchmarkListener = payload => {
            if (payload.status === 200) {
              this.rooms.push(payload.room);
              client.benchmarkListener = null;
              cb();
            } else {
              cb(payload);
            }
          };

          client.send(JSON.stringify({
            index: this.config.kuzzle.index,
            collection: this.config.kuzzle.collection,
            controller: 'realtime',
            action: 'subscribe',
            body: {
              geoPolygon: {
                geoPoint: {
                  points: [
                    [48.576610, -123.914438],
                    [48.229361, -87.906986],
                    [45.554516, -82.251513],
                    [41.965294, -82.872993],
                    [47.604591, -67.95746],
                    [44.363080, -66.699854],
                    [24.316997, -80.498681],
                    [31.741118, -106.373746],
                    [32.661164, -124.691714]
                  ]
                }
              }
            }
          }));
        };
      };

    console.log('Starting subscriptions...');

    const tasks = [];
    for(let i = 0; i < this.buffer.clients.length; i++) {
      tasks.push(currySubscribe(this.buffer.clients[i]));
    }

    async.parallel(tasks, err => {
      if (err) {
        return callback(err);
      }

      console.log(`Subscriptions done (took: ${Date.now() - start}ms)`);
      console.log(this.rooms.length);
      callback();
    });
  }
}

module.exports = RealtimeGeofencingStep;
