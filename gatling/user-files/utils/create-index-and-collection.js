const {
  Kuzzle,
  WebSocket
} = require('kuzzle-sdk');

const kuzzle = new Kuzzle(
  new WebSocket('localhost')
);

kuzzle.on('networkError', error => {
  // eslint-disable-next-line no-console
  console.error('Network Error:', error);
});

const run = async () => {
  try {
    await kuzzle.connect();
    await kuzzle.index.create('nyc-open-data');
    await kuzzle.collection.create('nyc-open-data', 'yellow-taxi');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error.message);
  } finally {
    kuzzle.disconnect();
  }
};
run();