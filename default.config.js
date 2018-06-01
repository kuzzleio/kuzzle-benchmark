/**
 * /!\ DO NOT MODIFY THIS FILE
 *
 * To customize your Kuzzle installation, create a
 * '.benchmarkrc' file and put your overrides there.
 * Please check the '.benchmarkrc.sample' file to get
 * started.
 *
 * @class BenchmarkConfiguration
 */
module.exports = {
  benchmark: {
    silent: false,
    clients: 1000,
    resultDirectory: 'benchmarkResults'
  },
  kuzzle: {
    host: 'localhost',
    port: 7512,
    index: 'benchmark',
    collection: 'scenarios'
  },
  documents: {
    count: 1000000,
    bufferSize: 100000
  },
  subscriptions: {
    count: 10000
  }
};
