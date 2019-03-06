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
    await kuzzle.index.delete('nyc-open-data');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error.message);
  } finally {
    kuzzle.disconnect();
  }
};
run();