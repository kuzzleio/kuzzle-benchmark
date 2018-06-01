'use strict';

const AbstractStep = require('./AbstractStep');

/**
 * This step sends real-time messages to kuzzle and measure
 * its response time.
 *
 * Used as a control step to get base measures.
 */
class RealtimeControlStep extends AbstractStep {
  constructor(reporter, buffer, config) {
    super(reporter, buffer, config, 'RealTimeControlStep', 'Real-time control step, measuring raw Kuzzle response time');
  }

  run(callback) {
    super.run();

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

    this.benchmark(fn, callback);
  }
}

module.exports = RealtimeControlStep;
