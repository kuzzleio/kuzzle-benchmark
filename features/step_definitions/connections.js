'use strict';

const
  Kuzzle = require('kuzzle-sdk'),
  logUpdate = require('log-update');

module.exports = function () {
  this.Given(/^an index named "(\w+)" and a collection named "(\w+)"$/, function (index, collection) {
    this.index = index;
    this.collection = collection;
  });

  this.Given(/^(\d+) sender connections$/, {timeout: 60 * 60 * 1000}, function (connections, callback) {
    var
      cnx = Number.parseInt(connections),
      count = 0,
      connect = () => {
        new Kuzzle(this.kuzzleUrl, {defaultIndex: this.index}, (err, k) => {
          this.senderConnections.push(k);
          count++;
          logUpdate('Connecting clients: ' + count + '/' + cnx);

          if (count === cnx) {
            logUpdate.done();
            callback();
          }
          else {
            connect();
          }
        });
      };

    connect();
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
