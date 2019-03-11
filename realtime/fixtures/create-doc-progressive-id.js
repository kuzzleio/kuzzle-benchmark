const { Kuzzle, WebSocket } = require('kuzzle-sdk');
const config = require('../config.json');

const kuzzle = new Kuzzle(new WebSocket(config.target.host));

const run = async () => {
  await kuzzle.connect();
  const promises = [];

  if (!(await kuzzle.index.exists(config.target.index))) {
    await kuzzle.index.create(config.target.index);
  }

  try {
    if (
      !(await kuzzle.collection.exists(
        config.target.index,
        config.target.collection
      ))
    ) {
      await kuzzle.collection.create(
        config.target.index,
        config.target.collection
      );
    }

    for (let id = 0; id <= config.fixtures.documentCount; id++) {
      console.log(`Creating document number ${id}...`);
      promises.push(
        kuzzle.document
          .create(
            config.target.index,
            config.target.collection,
            {
              driver: {
                name: 'Sirkis',
                licence: 'B'
              }
            },
            id.toString()
          )
          .then(() => {
            console.log(`Created document number ${id}.`);
          })
          .catch(err => {
            console.error(err);
          })
      );
    }

    await Promise.all(promises);
  } catch (err) {
    console.error(err);
    kuzzle.disconnect();
    process.exit(1);
  }

  kuzzle.disconnect();
  process.exit(0);
};

run();
