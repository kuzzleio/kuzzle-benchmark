const fs = require('fs'),
  readline = require('readline'),
  config = require('./config.json'),
  Client = require('./client'),
  { Kuzzle, WebSocket } = require('kuzzle-sdk');

function waitForTestEnd() {
  return new Promise((resolve, reject) => {
    const k = new Kuzzle(
      new WebSocket(host, { port: port, sslConnection: port === 443 }),
      { offlineMode: 'auto' }
    );

    k.connect()
      .then(() => {
        console.log('Waiting for benchmark to end...');
        k.realtime.subscribe(
          'nyc-open-data',
          'yellow-taxi',
          {
            equals: {
              message: 'end'
            }
          },
          () => {
            resolve(k);
            k.disconnect();
          }
        );
      })
      .catch(err => {
        reject(err);
      });
  });
}

function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve =>
    rl.question(query, ans => {
      rl.close();
      resolve(ans);
    })
  );
}

const host = config.target.host;
const port = 7512;
const clientCount = config.fixtures.clientCount;
const expectedNotifications = 1500;

const createClient = (clientId, filters) => {
  const client = new Client(clientId, host, port, expectedNotifications);

  return client.connect().then(() => {
    client.start({ subscribeFilters: filters });
    return client;
  });
};

const clients = [];

const run = async () => {
  const promises = [];
  const reports = [];

  try {
    for (let i = 0; i < clientCount; ++i) {
      const filters = {
        ids: {
          values: [(i % config.fixtures.documentCount).toString()]
        }
      };
      promises.push(
        createClient(i, filters).then(client => clients.push(client))
      );
    }
    await Promise.all(promises);
    console.log(`${clientCount} clients connected\n`);

    await waitForTestEnd();

    clients.forEach(client => {
      reports.push(client.report());
      client.stop();
    });

    fs.writeFileSync('report.json', JSON.stringify(reports));

    console.log('Benchmark ended. Results written to report.json\n');
  } catch (error) {
    console.error(error);
  }
  process.exit(0);

  // let ko = 0;
  // let missing = 0;
  // // let missing2 = 0;

  // for (const client of clients) {
  //   if (client.ko()) {
  //     ko += 1;
  //     // missing += expectedNotifications - client.notificationsCount;
  //   }
  //   missing += expectedNotifications - client.notificationsCount;
  // }
  // console.log(
  //   `${ko} client does not receive ${expectedNotifications} notifications`
  // );
  // console.log(`${missing} total notifications are missing`);
};

run();

// (async () => {
//   const cli = new Client(1, host, port)
//   await cli.connect()
//   await cli.start()
// })()
