const
  async = require('async'),
  logUpdate = require('log-update');

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
    this.rooms = [];

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
      console.log('='.repeat(79));
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
      notifications = 0,
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

      if (response.state === 'done') {
        notifications++;
        return;
      }

      if (errored || total >= batchSize || done >= packet) {
        return runnercb();
      }

      total++;
      runner(client, docno+1, done+1, runnercb);
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

    let lastNotifCount = notifications;
    const
      start = Date.now(),
      timer = setInterval(() => {
        const
          elapsed = Date.now() - start,
          requestsRate = Math.round(total / elapsed * 1000);

        this.log.update(`${Math.round(total*100/batchSize)}% | Requests completed: ${total} | Elapsed: ${Math.round(elapsed / 1000)}s | ${requestsRate} requests/s | ${notifications} notifications received`);

        if (errored || (lastNotifCount === notifications && waitingForRunners === 0)) {
          clearInterval(timer);
          this.log.done();

          if (!errored) {
            this.reporter.append(this.name, {
              elapsed,
              requestsRate,
              notifications,
              clients,
              requests: total,
              description: this.description,
            }, callback);
          }
        }

        lastNotifCount = notifications;
      }, 200);
  }

  subscribe(filters, callback) {
    const
      start = Date.now(),
      currySubscribe = client => {
        return cb => {
          client.benchmarkListener = payload => {
            if (payload.status === 200) {
              this.rooms.push(payload.result.roomId);
              client.benchmarkListener = null;
              cb();
            } else {
              cb(payload);
            }
          };

          client.send(JSON.stringify({
            index: this.config.kuzzle.index,
            collection: this.config.kuzzle.collection,
            controller: 'realtime',
            action: 'subscribe',
            body: filters
          }));
        };
      };

    console.log('Starting subscriptions...');

    const tasks = [];
    for(let i = 0; i < this.buffer.clients.length; i++) {
      tasks.push(currySubscribe(this.buffer.clients[i]));
    }

    async.parallel(tasks, err => {
      if (err) {
        return callback(err);
      }

      console.log(`Subscriptions done (took: ${Date.now() - start}ms)`);
      callback();
    });
  }

  unsubscribe(callback) {
    const
      start = Date.now(),
      currySubscribe = idx => {
        return cb => {
          this.buffer.clients[idx].benchmarkListener = () => {
            this.buffer.clients[idx].benchmarkListener = null;
            cb();
          };

          this.buffer.clients[idx].send(JSON.stringify({
            controller: 'realtime',
            action: 'unsubscribe',
            body: {
              roomId: this.rooms[idx]
            }
          }));
        };
      };

    console.log('Unsubscribing...');

    const tasks = [];
    for(let i = 0; i < this.buffer.clients.length; i++) {
      tasks.push(currySubscribe(i));
    }

    async.parallel(tasks, err => {
      if (err) {
        return callback(err);
      }

      console.log(`Unsubscriptions done (took: ${Date.now() - start}ms)`);
      this.rooms = [];
      callback();
    });
  }
}

module.exports = AbstractStep;
