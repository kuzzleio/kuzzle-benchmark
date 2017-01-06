const
  async = require('async'),
  Reporter = require('../core/reporter');

class Steps {
  constructor(buffer, config) {
    this.stdout = !config.benchmark.silent;
    this.reporter = new Reporter(config);

    this.steps = [
      new (require('./realtimeControl'))(this.reporter, buffer, config)
    ];
  }

  start(callback) {
    async.series(this.steps.map(s => (cb) => {
      this.stdout && console.log(`=== ${s.description}`);
      s.run(cb);
    }), err => callback(err));
  }
}

module.exports = Steps;
