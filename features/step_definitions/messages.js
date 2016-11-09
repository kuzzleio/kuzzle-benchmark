module.exports = function () {
  this.When(/^I send real-time messages$/, {timeout: 60 * 60 * 1000}, function (callback) {
    var
      start = Date.now(),
      done = 0;

    this.notifications = 0;

    var sendPacket = () => {
      var i;

      for (i = 0; i < Math.min(this.packetSize, this.messagesCount) - 1; i++) {
        this.senderConnections[(done + i) % this.senderConnections.length]
          .dataCollectionFactory(this.collection)
          .publishMessage(this.generateDocument());
      }

      done += i;

      this.senderConnections[done % this.senderConnections.length]
        .dataCollectionFactory(this.collection)
        .publishMessage(this.generateDocument(), (err, response) => {
          var elapsed;

          if (err) {
            return callback(err);
          }

          if (response.status !== 200) {
            return callback(response);
          }

          done++;

          this.consoleOutputProgress && console.log(`=> ${done} messages processed`);

          if (done >= this.messagesCount) {
            if (this.notifications > 0) {
              console.log('Notifications received: ', this.notifications);
            }

            elapsed = Math.floor((Date.now() - start) / 1000);
            console.log('Time elapsed: ', elapsed, 'seconds (', Math.floor(this.messagesCount / elapsed), 'messages/s)');

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
