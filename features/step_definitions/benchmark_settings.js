module.exports = function () {
  this.Given(/^an index named "(\w+)"$/, function (index) {
    this.index = index;
  });

  this.Given(/^a collection named "(\w+)"$/, function (collection) {
    this.collection = collection;
  });

  this.Given(/^an amount of ([0-9]+) messages or documents to send, ([0-9]+) at a time$/, function (count, packet) {
    this.messagesCount = count;
    this.packetSize = packet;
  });

  this.Given(/^an amount of ([0-9]+) subscriptions to perform$/, function (count) {
    this.subscriptionsCount = count;
  });

  this.Given(/^(no |)progress output on the console$/, function (no) {
    this.consoleOutputProgress = !(no.length > 0);
  });
};
