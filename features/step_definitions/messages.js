module.exports = function () {
  this.When(/^I send real-time messages$/, {timeout: 60 * 60 * 1000}, function (callback) {
    var
      done = 0;

    this.notifications = 0;

    var sendPacket = () => {
      var i;

      for (i = 0; i < this.packetSize - 1; i++) {
        this.senderConnections[(done + i) % this.senderConnections.length]
          .dataCollectionFactory(this.collection)
          .publishMessage(this.generateDocument());
      }

      done += i;

      this.senderConnections[done % this.senderConnections.length]
        .dataCollectionFactory(this.collection)
        .publishMessage(this.generateDocument(), (err, response) => {
          if (err) {
            return callback(err);
          }

          if (response.status !== 200) {
            return callback(response.error.message);
          }

          done++;
          console.log(`=> ${done} messages processed`);

          if (done >= this.messagesCount) {
            if (this.notifications > 0) {
              console.log('Notifications received: ', this.notifications);
            }

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
