const fs = require('fs'),
  readline = require('readline'),
  config = require('./config.json'),
  Client = require('./client'),
  { Kuzzle, WebSocket } = require('kuzzle-sdk');

function awaitTime(milliseconds) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, milliseconds);
  });
}
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
      if (i % 50 === 0) {
        await awaitTime(1000);
      }
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

    fs.writeFileSync(
      `report-${Date.now()}-${process.pid}.json`,
      JSON.stringify(reports, null, 2)
    );

    const avgReport = reports.reduce(
      (accumulator, currentValue) => {
        accumulator.notificationCount += currentValue.notificationCount;
        accumulator.avgLatency += currentValue.avgLatency;
        return accumulator;
      },
      { notificationCount: 0, avgLatency: 0 }
    );

    console.log('\n==================================================');
    console.log('* Benchmark finished successfully\n*');
    console.log(
      `* Average notifications received: ${avgReport.notificationCount /
        reports.length}`
    );
    console.log(
      `* Average latency: ${avgReport.avgLatency / reports.length}\n*`
    );
    console.log('* Results written to report.json');
    console.log('==================================================\n');
  } catch (error) {
    console.error(error);
  }
  process.exit(0);
};

run();
