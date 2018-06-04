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
    super(reporter, buffer, config, 'RealtimeGeofencingLarge', 'Geopolygon subscriptions listening to geopoints in the US');
  }

  run(callback) {
    super.run();

    const filters = {
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
    };

    this.subscribe(filters, err => {
      if (err) {
        return callback(err);
      }

      const fn = (client, doc, cb) => {
        client.benchmarkListener = cb;
        client.send(JSON.stringify({
          index: this.config.kuzzle.index,
          collection: this.config.kuzzle.collection,
          controller: 'realtime',
          action: 'publish',
          body: doc
        }));
      };

      this.benchmark(fn, err => {
        if (err) {
          callback(err);
        } else {
          this.unsubscribe(callback);
        }
      });
    });
  }
}

module.exports = RealtimeGeofencingStep;
