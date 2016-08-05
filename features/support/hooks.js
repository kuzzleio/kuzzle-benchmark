module.exports = function () {
  // Reinitialize connections variables
  this.After(function (scenario, callback) {
    this.senderConnections.forEach(connection => connection.disconnect());
    this.subscribeConnections.forEach(connection => connection.disconnect());

    this.senderConnections = [];
    this.subscribeConnections = [];

    setTimeout(() => {
      callback();
    }, 5000);
  });
};
