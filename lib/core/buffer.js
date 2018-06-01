'use strict';

const
  logUpdate = require('log-update'),
  WS = require('uws'),
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
      c.terminate();
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
    step = Math.round(documents.length / 100),
    meanSize = [];

  for(let i = 0; i < documents.length; i++) {
    documents[i] = generator.generate();

    if (stdout && i%step === 0) {
      stdout && logUpdate(`\tDocuments: ${i} / ${documents.length}`);
      meanSize.push(Buffer.byteLength(JSON.stringify(documents[i])));
    }
  }

  if (stdout) {
    logUpdate(`\tDocuments: ${documents.length} / ${documents.length} (mean size: ${Math.round(meanSize.reduce((acc, c) => acc + c, 0) / meanSize.length)} bytes)`);
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
    expected = clients.length + count,
    address = `ws://${kuzzleConfig.host}:${kuzzleConfig.port}`;
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

    const ws = new WS(address, {perMessageDeflate: false});

    ws.onopen = () => {
      clients.push(ws);
    };

    ws.onerror = err => {
      console.log(err);
      clearInterval(timer);
      cb(err);
    };

    ws.onmessage = payload => {
      if (ws.benchmarkListener) {
        // const data = JSON.parse(payload.data);

        // if (data.result && !data.result.published) {console.dir(data, {depth: null, colors: true})}
        ws.benchmarkListener(JSON.parse(payload.data || payload));
      }
    };
  }
}

module.exports = BenchmarkBuffer;
