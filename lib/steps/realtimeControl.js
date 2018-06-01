'use strict';

const
  AbstractStep = require('./AbstractStep'),
  logUpdate = require('log-update');

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
    const fn = (client, doc, cb) => {
      client.collection(this.config.kuzzle.collection).publishMessage(doc, cb);
    };

    this.benchmark(fn, callback);
  }
}

module.exports = RealtimeControlStep;
