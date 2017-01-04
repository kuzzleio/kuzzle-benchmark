'use strict';

const logUpdate = require('log-update');

module.exports = function () {
  this.When(/^I send real-time messages$/, {timeout: 60 * 60 * 1000}, function (callback) {
    const
      elapsedList = [];
    var
      totalTime = 0,
      done = 0;

    this.notifications = 0;

    var sendPacket = () => {
      const start = Date.now();
      var i;

      for (i = 0; i < this.packetSize - 1; i++) {
        this.senderConnections[(done + i) % this.senderConnections.length]
          .dataCollectionFactory(this.collection)
          .publishMessage(this.documents[(done + i) % this.documents.length]);
      }

      done += i;

      this.senderConnections[done % this.senderConnections.length]
        .dataCollectionFactory(this.collection)
        .publishMessage(this.documents[(done + 1) % this.documents.length], (err, response) => {
          if (err) {
            return callback(err);
          }

          if (response.status !== 200) {
            return callback(response);
          }

          const elapsed = (Date.now() - start) / 1000;

          totalTime += elapsed;
          elapsedList.push(elapsed);

          const meanElapsed = elapsedList.reduce((p, c) => c + p, 0) / elapsedList.length;
          const meanMessagesSecond = this.packetSize / meanElapsed;

          done++;

          logUpdate(`${Math.round(done*100/this.messagesCount)}% | Elapsed: ${Math.round(totalTime)}s | ${Math.round(meanMessagesSecond)} msg/s | Mean packet time: ${Math.round(meanElapsed*100)/100}s`);

          if (done >= this.messagesCount) {
            if (this.notifications > 0) {
              console.log('Notifications received: ', this.notifications);
            }

            logUpdate.done();
            callback();
          }
          else {
            sendPacket();
          }
        });
      };

    sendPacket();
  });
};
