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
    super(reporter, buffer, config, 'DocumentWriteWithSubscriptions', 'Writing documents to Elasticsearch 1 by 1 (with listeners)');

    // This scenario gives such bad results that we have to
    // limit the benchmark scope
    this.limits = {
      maxRequests: 1000,
      maxClients: 100
    };
  }

  run(callback) {
    super.run();

    const filters = {
      range: {
        anInteger: {
          gte: 500
        }
      }
    }

    this.subscribe(filters, err => {
      if (err) {
        return callback(err);
      }

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

      this.benchmark(fn, err => {
        if (err) {
          callback(err);
        } else {
          this.unsubscribe(callback);
        }
      }, this.limits);
    });
  }
}

module.exports = SimpleDocumentWriteStep;
