const { Kuzzle, WebSocket } = require('kuzzle-sdk');

class Client {
  constructor(id, host, port, expectedNotifications) {
    this.id = id;
    this.expectedNotifications = expectedNotifications;
    this.kuzzle = new Kuzzle(
      new WebSocket(host, { port: port, sslConnection: port === 443 }),
      { offlineMode: 'auto' }
    );

    this.room = null;

    this.disconnectCount = 0;
    this.reconnectCount = 0;

    this.notifications = [];
    this.notificationCount = 0;
    this.notificationLatencySum = 0;

    this.kuzzle.addListener('networkError', error => {
      console.error(error);
    });

    this.kuzzle.addListener('reconnected', () => {
      this.reconnectCount += 1;
    });

    this.kuzzle.addListener('disconnected', () => {
      this.disconnectCount += 1;
    });
  }

  connect() {
    return this.kuzzle.connect();
  }

  login(strategy, credentials) {
    return this.kuzzle.auth.login(strategy, credentials);
  }

  async start(options) {
    try {
      const filters = options.subscribeFilters || {};
      this.room = await this.kuzzle.realtime.subscribe(
        'nyc-open-data',
        'yellow-taxi',
        filters,
        notification => {
          if (!notification.volatile || !notification.volatile.timestamp) {
            return;
          }
          this.notificationLatencySum +=
            Date.now() - notification.volatile.timestamp;
          this.notificationCount += 1;
        }
      );

      console.log(
        `Client ${this.id} connected with filters ${JSON.stringify(filters)}`
      );
    } catch (error) {
      console.error(error);
    }
  }

  stop() {
    return this.kuzzle.realtime
      .unsubscribe(this.room)
      .then(() => this.kuzzle.disconnect());
  }

  ok() {
    return this.notificationCount === this.expectedNotifications;
  }

  ko() {
    return !this.ok();
  }

  report() {
    // console.log(
    //   `[Client ${this.id}] - Received ${this.notificationCount} / ${
    //     this.expectedNotifications
    //   } - Avg. Latency: ${this.notificationLatencySum /
    //     this.notificationCount}`
    // );

    return {
      id: this.id,
      notificationCount: this.notificationCount,
      avgLatency: this.notificationLatencySum / this.notificationCount
    };

    // if (this.disconnectCount !== 0 || this.reconnectCount !== 0 || this.ko()) {
    //   console.log(
    //     '\n--------------------------------------------------------------------'
    //   );
    //   if (this.ko()) {
    //     console.log(
    //       `[Client ${this.id}] ${
    //         this.notificationCount
    //       } notifications received`
    //     );
    //   } else {
    //     console.log(
    //       `[Client ${this.id}] ${this.disconnectCount} disconnected events`
    //     );
    //     console.log(
    //       `[Client ${this.id}] ${this.reconnectCount} reconnect events`
    //     );
    //   }
    // }

    // fs.writeFileSync(`${this.id}-report.json`, JSON.stringify({
    //   disconnectCount: this.disconnectCount,
    //   reconnectCount: this.reconnectCount,
    //   notificationCount: this.notifications.length,
    //   notifications: this.notifications
    // }));
  }
}

module.exports = Client;
