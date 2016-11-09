var
  Kuzzle = require('kuzzle-sdk');

module.exports = function () {
  this.Given(/^an index named "(\w+)" and a collection named "(\w+)"$/, function (index, collection) {
    this.index = index;
    this.collection = collection;
  });

  this.Given(/^(\d+) sender connections$/, function (connections, callback) {
    var i;

    for (i = 0; i < connections; ++i) {
      this.senderConnections.push(new Kuzzle(this.kuzzleUrl, {defaultIndex: this.index}));
    }

    callback();
  });

  this.Given(/^(\d+) http connections$/, function (connections, callback) {
    var i;
    for (i = 0; i < connections; ++i) {
      this.senderConnections.push(new HttpClient(this.kuzzleHttpUrl, this.index));
    }

    callback();
  });

  this.Given(/^(\d+) subscribe connections$/, function (connections, callback) {
    var i;

    for (i = 0; i < connections; ++i) {
      this.subscribeConnections.push(new Kuzzle(this.kuzzleUrl, {defaultIndex: this.index}));
    }

    callback();
  });
};
