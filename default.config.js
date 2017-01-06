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
    clients: 100,
    resultDirectory: 'benchmarkResults'
  },
  kuzzle: {
    host: 'localhost',
    url: 'http://localhost:7511',
    index: 'benchmark',
    collection: 'scenarios'
  },
  documents: {
    count: 100000,
    packetSize: 500,
    bufferSize: 100000
  },
  subscriptions: {
    count: 10000
  }
};
