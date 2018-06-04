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

    const filters = {
      geoPolygon: {
        geoPoint: {
          points: [
            [51.093982, 2.454298],
            [48.479936, -4.862113],
            [43.407110, -1.821924],
            [42.440482, 3.200069],
            [43.71992, 7.565],
            [48.985366, 8.220864]
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
