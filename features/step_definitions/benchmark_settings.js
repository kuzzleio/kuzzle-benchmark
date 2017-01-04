const logUpdate = require('log-update');

module.exports = function () {
  this.Given(/^an index named "(\w+)"$/, function (index) {
    this.index = index;
  });

  this.Given(/^a collection named "(\w+)"$/, function (collection) {
    this.collection = collection;
  });

  this.Given(/^an amount of ([0-9]+) messages or documents to send, ([0-9]+) at a time$/, function (count, packet) {
    this.messagesCount = Math.max(packet, count);
    this.packetSize = packet;

    this.documents = new Array(Math.min(this.maxBufferedDocuments, this.messagesCount));

    const step = Math.round(this.documents.length / 100);

    for(let i = 0; i < this.documents.length; i++) {
      this.documents[i] = this.generateDocument();

      if (i % step === 0) {
        logUpdate('Buffering documents: ' + i/step + '%');
      }
    }

    logUpdate('Buffering documents: 100%');
    logUpdate.done();
  });

  this.Given(/^an amount of ([0-9]+) subscriptions to perform$/, function (count) {
    this.subscriptionsCount = count;
  });
};
