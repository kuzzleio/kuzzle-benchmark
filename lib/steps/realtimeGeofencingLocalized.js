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
    super(reporter, buffer, config, 'RealtimeGeofencingLocalized', 'Geopolygon subscriptions listening to geopoints in France');
  }

  run(callback) {
    super.run();

    const generateFilters = () => ({
      geoPolygon: {
        geoPoint: {
          points: [
            [51 + Math.random(), 2 + Math.random()],
            [48 + Math.random(), -4 - Math.random()],
            [43 + Math.random(), -1 - Math.random()],
            [42 + Math.random(), 3 + Math.random()],
            [43 + Math.random(), 7 + Math.random()],
            [48 + Math.random(), 8 + Math.random()]
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
