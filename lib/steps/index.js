const
  async = require('async'),
  Reporter = require('../core/reporter');

class Steps {
  constructor(buffer, config) {
    this.reporter = new Reporter(config);
    this.buffer = buffer;
    this.config = config;
    this.steps = config.benchmark.scenarios
      .map(step => new (require(`./${step}`))(this.reporter, buffer, config));
  }

  prepare(callback) {
    this.buffer.clients[0].benchmarkListener = () => {
      this.buffer.clients[0].benchmarkListener = () => {
        this.buffer.clients[0].benchmarkListener = null;
        console.log(`\tCollection "${this.config.kuzzle.collection}" created`);
        callback();
      };

      console.log(`\tIndex "${this.config.kuzzle.index}" created`);
      this.buffer.clients[0].send(JSON.stringify({
        index: this.config.kuzzle.index,
        collection: this.config.kuzzle.collection,
        controller: 'collection',
        action: 'create'
      }));
    };

    console.log('Preparing Database:');
    this.buffer.clients[0].send(JSON.stringify({
      index: this.config.kuzzle.index,
      controller: 'index',
      action: 'create'
    }));
  }

  start(callback) {
    this.reporter.open();

    const tasks = [this.prepare.bind(this), ...this.steps.map(s => s.run.bind(s))];

    async.series(tasks, err => {
      this.reporter.close();
      callback(err);
    });
  }
}

module.exports = Steps;
