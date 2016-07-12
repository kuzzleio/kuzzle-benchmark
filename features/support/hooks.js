module.exports = function () {
  // Reinitialize connections variables
  this.Before(function () {
    this.senderConnections.forEach(connection => connection.disconnect());
    this.subscribeConnections.forEach(connection => connection.disconnect());

    this.senderConnections = [];
    this.subscribeConnections = [];
  });
};
