const logUpdate = require('log-update');

/**
 * Abstract class used to define a benchmark scenario step.
 * @class
 */
class AbstractStep {
  /**
   *
   * @param {Reporter} reporter
   * @param {BenchmarkBuffer} buffer
   * @param {BenchmarkConfiguration} config
   * @param {string} name of the step
   * @param {string} description of the step
   */
  constructor (reporter, buffer, config, name, description) {
    this.reporter = reporter;
    this.buffer = buffer;
    this.config = config;
    this.name = name;
    this.description = description;

    // this.reporter.create(this);

    // this.reporter.write([
    //   'Mean requests/second rate',
    //   'Total requests sent',
    //   'Total elapsed time'
    // ]);

    this.log = {
      update: config.benchmark.silent ? () => {} : logUpdate,
      done: config.benchmark.silent ? () => {} : logUpdate.done
    };
  }

  /**
   * Launches this benchmark step
   * @param {function} callback
   */
  run(callback) { // eslint-disable-line no-unused-vars
    if (!this.config.benchmark.silent) {
      console.log(`=== ${this.description}`);
    }
  }

  /**
   * Run the benchmark, using the provided "fn" function with the
   * following expected prototype:
   *     fn(client, payload, callback)
   *
   * Options:
   *   * maxRequests:
   *     override this.config.documents.count (used to limit the
   *     batch size for slow steps)
   *   * maxClients:
   *     override this.config.benchmark.clients (used to control
   *     the kuzzle stack capabilities on small-size environements)
   * @param  {Function} fn
   * @param  {Function} callback - nodeback resolution
   * @param  {Object} opts
   */
  benchmark(fn, callback, opts = {}) {
    const
      batchSize = opts.maxRequests || this.config.documents.count,
      clients = opts.maxClients || this.buffer.clients.length,
      packet = Math.max(1, Math.round(batchSize / clients));
    let
      total = 0,
      errored = false,
      waitingForRunners = clients;

    if (!this.config.benchmark.silent) {
      if (Object.keys(opts).length > 0) {
        console.log(`(limits: ${batchSize} requests, ${clients} clients)`);
      }
    }

    const runner = (client, docno, done, runnercb) => fn(client, this.buffer.documents[docno % this.buffer.documents.length], response => {
      if (response.status !== 200) {
        errored = true;
        return runnercb(response);
      }

      if (errored || total >= batchSize) {
        return runnercb();
      }

      total++;

      if (done < packet) {
        return runner(client, docno+1, done+1, runnercb);
      }

      runnercb();
    });

    for(let i = 0; i < clients; i++) {
      runner(this.buffer.clients[i], i * clients, 0, err => {
        if (err) {
          console.log(err);
          return callback(err);
        }

        waitingForRunners--;
      });
    }

    const
      start = Date.now(),
      timer = setInterval(() => {
        const
          elapsed = Date.now() - start,
          requestsSecond = Math.round(total / elapsed * 1000);

        this.log.update(`${Math.round(total*100/batchSize)}% | Requests completed: ${total} | Elapsed: ${Math.round(elapsed / 1000)}s | ${requestsSecond} requests/s`);

        if (errored || waitingForRunners === 0) {
          clearInterval(timer);
          this.log.done();

          if (!errored) {
            // this.reporter.write([
            //   requestsSecond,
            //   total,
            //   elapsed
            // ]);

            callback();
          }
        }
      }, 200);
  }
}

module.exports = AbstractStep;
