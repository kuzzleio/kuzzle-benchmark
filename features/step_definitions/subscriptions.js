module.exports = function () {
  this.subscribed = 0;

  this.When(/^I make subscriptions with simple "(.+)" filter$/, {timeout: 10 * 60 * 1000}, function (dslKeyword, callback) {
    this.subscribed = 0;
    subscribe(this, callback, dslKeyword);
  });

  this.When(/^I make subscriptions with complex filters$/, {timeout: 10 * 60 * 1000}, function (callback) {
    this.subscribed = 0;
    //console.log('Subscriptions: ', this.subscribeConnections.length);
    subscribe(this, callback);
  });
};

function subscribe (world, callback, dslKeyword) {
  var
    args = {
      controller: 'subscribe',
      action: 'on',
      index: world.index,
      collection: world.collection
    },
    i,
    filterGenerator = dslKeyword ? world.generateSimpleFilter : world.generateComplexFilter;

  for(i = 0; i < world.packetSize-1; ++i) {
    world.subscribeConnections[i % world.subscribeConnections.length]
      .query(args, filterGenerator(dslKeyword));
  }

  world.subscribed += i;
//console.log(world.subscribed);
  world.subscribeConnections[i % world.subscribeConnections.length]
    .query(args, filterGenerator(dslKeyword), (error, response) => {
      if (error) {
        return callback(error);
      }

      if (response.status !== 200) {
        return callback(response.error.message);
      }

      world.subscribed++;
      world.consoleOutputProgress && console.log(`=> Subscribed: ${world.subscribed}`);

      if (world.subscribed >= world.subscriptionsCount) {
        callback();
      }
      else {
        subscribe(world, callback, dslKeyword);
      }
    });
}
