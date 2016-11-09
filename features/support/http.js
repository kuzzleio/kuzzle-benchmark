var
  request = require('request');

module.export = HttpClient = function (kuzzleUrl, index) {
  this.kuzzleUrl = kuzzleUrl;
  this.index = index;
  this.collection = '';
};

HttpClient.prototype.callApi = function (route, method, body, callback) {
  var options = {
    url: this.kuzzleUrl + route,
    method,
    body,
    json: true,
    forever: true,
    headers: {
      Connection: 'keep-alive'
    }
  };
  request(options, (err, res) => {
    if (callback) {
      callback(err, res && res.body);
    }
  });
};

HttpClient.prototype.disconnect = function () {};

HttpClient.prototype.dataCollectionFactory = function(collection) {
  this.collection = collection;
  return this;
};

HttpClient.prototype.publishMessage = function(message, callback) {
  var
    url = this.index + '/' + this.collection,
    method = 'POST',
    body = message;

  return this.callApi(url, method, body, callback);

};
