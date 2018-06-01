'use strict';

const AbstractStep = require('./AbstractStep');

/**
 * This step sends real-time messages to kuzzle and measure
 * its response time.
 *
 * Used as a control step to get base measures.
 */
class SimpleDocumentWriteStep extends AbstractStep {
  constructor(reporter, buffer, config) {
    super(reporter, buffer, config, 'SimpleDocumentWriteStep', 'Writing documents to Elasticsearch 1 by 1 (no listeners)');

    // This scenario gives such bad results that we have to
    // limit the benchmark scope
    this.limits = {
      maxRequests: 1000,
      maxClients: 100
    };
  }

  run(callback) {
    super.run();

    const fn = (client, doc, cb) => {
      client.benchmarkListener = cb;
      client.send(JSON.stringify({
        index: this.config.kuzzle.index,
        collection: this.config.kuzzle.collection,
        controller: 'document',
        action: 'create',
        body: doc
      }));
    };

    this.benchmark(fn, callback, this.limits);
  }
}

module.exports = SimpleDocumentWriteStep;
