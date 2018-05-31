'use strict';

const
  AbstractStep = require('./AbstractStep'),
  logUpdate = require('log-update');

/**
 * This step sends real-time messages to kuzzle and measure
 * its response time.
 *
 * Used as a control step to get base measures.
 */
class RealtimeControlStep extends AbstractStep {
  constructor(reporter, buffer, config) {
    super(reporter, buffer, config, 'RealTimeControlStep', 'Real-time control step, measuring Kuzzle response time');

    this.elapsedList = [];
    this.totalTime = 0;
    this.done = 0;

    this.reporter.write([
      'Packet time',
      'Mean packet time',
      'Mean messages/second rate',
      'Total messages sent',
      'Total elapsed time'
    ]);
  }

  run(callback) {
    const start = Date.now();
    let i;

    for (i = 0; i < this.config.documents.packetSize - 1; i++) {
      this.buffer.clients[(this.done + i) % this.buffer.clients.length]
        .collection(this.config.kuzzle.collection)
        .publishMessage(this.buffer.documents[(this.done + i) % this.buffer.documents.length]);
    }

    this.done += i;

    this.buffer.clients[this.done % this.buffer.clients.length]
      .collection(this.config.kuzzle.collection)
      .publishMessage(this.buffer.documents[(this.done + 1) % this.buffer.documents.length], (err, response) => {
        if (err) {
          return callback(err);
        }

        if (response.status !== 200) {
          return callback(response);
        }

        const elapsed = (Date.now() - start) / 1000;

        this.totalTime += elapsed;
        this.elapsedList.push(elapsed);

        const
          meanElapsed = this.elapsedList.reduce((p, c) => c + p, 0) / this.elapsedList.length,
          meanMessagesSecond = this.config.documents.packetSize / meanElapsed,
          messagesSecond = this.config.documents.packetSize / elapsed;

        this.done++;

        this.reporter.write([
          elapsed,
          meanElapsed,
          meanMessagesSecond,
          this.done,
          this.totalTime
        ]);
        this.stdout && logUpdate(`${Math.round(this.done*100/this.config.documents.count)}% | Elapsed: ${Math.round(this.totalTime)}s | ${Math.round(meanMessagesSecond)} msg/s (latest packet: ${Math.round(messagesSecond)}) | Mean packet time: ${meanElapsed.toFixed(2)}s`);

        if (this.done >= this.config.documents.count) {
          this.stdout && logUpdate.done();
          callback();
        }
        else {
          this.run(callback);
        }
      });
  }
}

module.exports = RealtimeControlStep;
