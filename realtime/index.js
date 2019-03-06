const readline = require('readline'),
  Client = require('./client');

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

const host = 'localhost';
const port = 7512;
const clientCount = 300;
const expectedNotifications = 16500;

let clientId = 0;

const createClient = () => {
  const client = new Client(clientId, host, port, expectedNotifications);
  clientId += 1;

  return client.connect().then(() => {
    client.start();
    return client;
  });
};

const clients = [];

const run = async () => {
  const promises = [];
  for (let i = 0; i < clientCount; ++i) {
    promises.push(createClient().then(client => clients.push(client)));
  }
  await Promise.all(promises);
  console.log(`${clientCount} clients connected\n`);

  await askQuestion('Press a key to stop clients');

  clients.forEach(client => {
    client.report();
    client.stop();
  });

  let ko = 0;
  let missing = 0;
  // let missing2 = 0;

  for (const client of clients) {
    if (client.ko()) {
      ko += 1;
      // missing += expectedNotifications - client.notificationsCount;
    }
    missing += expectedNotifications - client.notificationsCount;
  }
  console.log(
    `${ko} client does not receive ${expectedNotifications} notifications`
  );
  console.log(`${missing} total notifications are missing`);
};

run();

// (async () => {
//   const cli = new Client(1, host, port)
//   await cli.connect()
//   await cli.start()
// })()
