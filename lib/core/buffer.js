'use strict';

const
  logUpdate = require('log-update'),
  Kuzzle = require('kuzzle-sdk'),
  Document = require('../generators/document');

/**
 * Creates and stores the document/subscriptions/connections/...
 * buffers needed to run benchmark scenarios
 *
 * @class {BenchmarkBuffer}
 */

class BenchmarkBuffer {
  /**
   * @param {BenchmarkConfiguration} config
   * @param {function} cb
   */
  constructor(config, cb) {
    this.stdout = !config.benchmark.silent;
    this.stdout && console.log('Buffering: ');

    this._documents = bufferDocuments(this.stdout, config.documents.count, config.documents.bufferSize);

    bufferClients(this.stdout, config.kuzzle, config.benchmark.clients, (err, clients) => {
      if (err) {
        return cb(err);
      }

      this._clients = clients;
      cb(null, this);
    });
  }

  get documents () {
    return this._documents;
  }

  get clients () {
    return this._clients;
  }

  free () {
    let count = 0;

    this._documents = null;
    this._clients.forEach(c => {
      if (this.stdout) {
        count++;
        logUpdate(`Disconnecting clients: ${count} / ${this._clients.length}`);
      }
      c.disconnect()
    });

    this.stdout && logUpdate.done();

    this._clients = null;
  }
}

/**
 * Creates a document buffer
 * @param {Boolean} stdout
 * @param {Number} count
 * @param {Number} maxBufSize
 * @return {Array}
 */
function bufferDocuments (stdout, count, maxBufSize) {
  const
    generator = new Document(),
    documents = new Array(Math.min(maxBufSize, count)),
    step = Math.round(documents.length / 100);

  for(let i = 0; i < documents.length; i++) {
    documents[i] = generator.generate();

    if (stdout && i%step === 0) {
      stdout && logUpdate(`\tDocuments: ${i} / ${documents.length}`);
    }
  }

  if (stdout) {
    logUpdate(`\tDocuments: ${documents.length} / ${documents.length}`);
    logUpdate.done();
  }

  return documents;
}

/**
 * Creates a connection buffer
 * @param {Boolean} stdout
 * @param {Object} kuzzleConfig
 * @param {Number} count
 * @param {function} cb
 * @return {Array}
 */
function bufferClients (stdout, kuzzleConfig, count, cb) {
  const
    clients = [],
    expected = clients.length + count;
  let i = 0;

  const timer = setInterval(() => {
    stdout && logUpdate(`\tClients: Instantiated=${i}, Connected=${clients.length}`);
    if (clients.length >= expected) {
      clearInterval(timer);
      stdout && logUpdate.done();
      cb(null, clients);
    }
  }, 100);

  for (i = 0; i < count; i++) {
    if (!(i % (count/100))) {
      stdout && logUpdate(`\tClients: Instantiated=${i}, Connected=${clients.length}`);
    }
    const kuzzle = new Kuzzle(kuzzleConfig.host, {port: kuzzleConfig.port, defaultIndex: kuzzleConfig.index}, err => {
      if (err) {
        console.log(err);
        clearInterval(timer);
        return cb(err);
      }

      clients.push(kuzzle);
    });
  }

  // return connect(count)
  //   .then(() => {
  //     cb(null, clients);
  //     stdout && logUpdate.done();
  //   })
  //   .catch(err => cb(err));
  // const
  //   promises = [],
  //   defaultPacket = 100;

  // for (let remaining = count; remaining > 0; remaining -= Math.min(remaining, defaultPacket)) {
  //   promises.push(() => connect()
  // }

  //         stdout && logUpdate(`\tConnecting clients: ${created} / ${count}`);
  //           ;

  // connect();
}

module.exports = BenchmarkBuffer;
