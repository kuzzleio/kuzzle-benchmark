'use strict';

const
  AbstractStep = require('./AbstractStep'),
  Random = require('random-js');

/**
 * This step sends real-time messages to kuzzle and measure
 * its response time.
 *
 * Used as a control step to get base measures.
 */
class SimpleDocumentWriteStep extends AbstractStep {
  constructor(reporter, buffer, config) {
    super(reporter, buffer, config, 'DocumentWriteWithSubscriptions', 'Writing documents to Elasticsearch 1 by 1 (with listeners)');
    this.randomEngine = new Random(Random.engines.nativeMath);
  }

  run(callback) {
    super.run();

    const generateFilters = () => ({
      range: {
        anInteger: {
          gte: this.randomEngine.integer(-500000, 500000)
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
          controller: 'document',
          action: 'create',
          body: doc
        }));
      };

      this.benchmark(fn, error => {
        if (error) {
          callback(error);
        } else {
          this.unsubscribe(callback);
        }
      }, this.limits);
    });
  }
}

module.exports = SimpleDocumentWriteStep;
