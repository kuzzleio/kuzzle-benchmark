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
    //   'Mean request time',
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
  run(callback) {
    callback(new Error('Step not implemented'));
  }

  /**
   * Run the benchmark, using the provided "fn" function with the
   * following expected prototype:
   *     fn(client, payload, nodeback)
   * @param  {Function} fn
   * @param  {Function} callback - nodeback resolution
   */
  benchmark(fn, callback) {
    const
      packet = Math.max(1, Math.round(this.config.documents.count / this.buffer.clients.length));
    let
      total = 0,
      errored = false,
      waitingForRunners = this.buffer.clients.length;

    const runner = (client, docno, done, runnercb) => fn(client, this.buffer.documents[docno % this.buffer.documents.length], (err, response) => {
      if (err || response.status !== 200) {
        errored = true;
        return runnercb(err || response);
      }

      if (errored) {
        return runnercb();
      }

      total++;

      if (done < packet) {
        return runner(client, docno+1, done+1, runnercb);
      }

      runnercb();
    });

    for(let i = 0; i < this.buffer.clients.length; i++) {
      runner(this.buffer.clients[i], i * this.buffer.clients.length, 0, err => {
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
          elapsedms = Date.now() - start,
          elapsed = elapsedms / 1000,
          requestsSecond = Math.round(total / elapsed),
          meanRequestTime = Math.round(total / elapsedms);

        this.log.update(`${Math.round(total*100/this.config.documents.count)}% | Messages sent: ${total} | Elapsed: ${Math.round(elapsed)}s | ${requestsSecond} msg/s | Mean Packet Time: ${meanRequestTime}ms`);

        if (errored || waitingForRunners === 0) {
          clearInterval(timer);
          this.log.done();

          if (!errored) {
            // this.reporter.write([
            //   requestsSecond,
            //   meanRequestTime,
            //   total,
            //   elapsed
            // ]);

            callback();
          }
        }
      }, 1000);
  }
}

module.exports = AbstractStep;
