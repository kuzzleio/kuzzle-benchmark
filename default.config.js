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
    clients: 10000,
    resultDirectory: 'benchmarkResults'
  },
  kuzzle: {
    host: 'localhost',
    url: 'http://localhost:7512',
    index: 'benchmark',
    collection: 'scenarios'
  },
  documents: {
    count: 1000000,
    packetSize: 500,
    bufferSize: 100000
  },
  subscriptions: {
    count: 10000
  }
};
