'use strict';

const AbstractStep = require('./AbstractStep');

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

    const generateFilters = () => ({
      geoPolygon: {
        geoPoint: {
          points: [
            [48 + Math.random(), -123 - Math.random()],
            [48 + Math.random(), -87 - Math.random()],
            [45 + Math.random(), -82 - Math.random()],
            [41 + Math.random(), -82 - Math.random()],
            [47 + Math.random(), -67 - Math.random()],
            [44 + Math.random(), -66 - Math.random()],
            [24 + Math.random(), -80 - Math.random()],
            [31 + Math.random(), -106 - Math.random()],
            [32 + Math.random(), -124 - Math.random()]
          ]
        }
      }
    });

    this.subscribe(generateFilters, err => {
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

      this.benchmark(fn, benchmarkErr => {
        if (benchmarkErr) {
          callback(benchmarkErr);
        } else {
          this.unsubscribe(callback);
        }
      });
    });
  }
}

module.exports = RealtimeGeofencingStep;
