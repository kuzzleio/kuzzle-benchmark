module.exports = function () {

  this.When(/^I make subscriptions with a simple "(.+)" filter$/, {timeout: 10 * 60 * 1000}, function (dslKeyword, callback) {
    var
      subscribed = 0,
      args = {
        controller: 'subscribe',
        action: 'on',
        index: this.index,
        collection: this.collection
      },
      subscribe = () => {
        var i;

        for(i = 0; i < this.packetSize-1; ++i) {
          this.subscribeConnections[i % this.subscribeConnections.length]
            .query(args, this.generateSimpleFilter(dslKeyword));
        }

        subscribed += i;

        this.subscribeConnections[i % this.subscribeConnections.length]
          .query(args, this.generateSimpleFilter(dslKeyword), (error, response) => {
            if (error) {
              return callback(error);
            }

            if (response.status !== 200) {
              return callback(response.error.message);
            }

            subscribed++;
            this.consoleOutputProgress && console.log(`=> Subscribed: ${subscribed}`);

            if (subscribed >= this.subscriptionsCount) {
              callback();
            }
            else {
              subscribe();
            }
          });
      };

    subscribe();
  });
};
