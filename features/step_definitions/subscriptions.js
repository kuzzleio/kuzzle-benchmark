module.exports = function () {

  this.When(/^I make subscriptions with a simple "(\w+)" filter$/, {timeout: 10 * 60 * 1000}, function (dslKeyword, callback) {
    var
      subscribed = 0,
      rooms = [],
      subscribe = () => {
        var i;

        for(i = 0; i < this.packetSize; ++i) {
          rooms.push(this.subscribeConnections[i % this.subscribeConnections.length]
            .dataCollectionFactory(this.collection)
            .subscribe(this.generateSimpleFilter(dslKeyword), () => {}));
        }

        waitForSubscriptions();
      },
      waitForSubscriptions = () => {
        var index = rooms.findIndex(kuzzleRoom => kuzzleRoom.roomId === null);

        if (index > -1) {
          rooms.splice(0, index);
          setTimeout(() => waitForSubscriptions(), 200);
        }
        else {
          subscribed += this.packetSize;
          console.log(`=> Subscribed: ${subscribed}`);
          if (subscribed < this.subscriptionsCount) {
            subscribe();
          }
          else {
            callback();
          }
        }
      };

    subscribe();
  });
};
