module.exports = function () {
  this.subscribed = 0;

  this.When(/^I make subscriptions with simple "(.+)" filters$/, {timeout: 60 * 60 * 1000}, function (dslKeyword, callback) {
    this.subscribed = 0;
    subscribe(this, callback, dslKeyword);
  });

  this.When(/^I make subscriptions with complex filters$/, {timeout: 10 * 60 * 1000}, function (callback) {
    this.subscribed = 0;
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
      .query(args, {body: filterGenerator(dslKeyword)});
  }

  world.subscribed += i;

  world.subscribeConnections[i % world.subscribeConnections.length]
    .query(args, {body: filterGenerator(dslKeyword)}, (error, response) => {
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
