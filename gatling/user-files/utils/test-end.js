const rp = require('request-promise');

const host = process.argv[2] || 'localhost';
const options = {
  method: 'POST',
  uri: `http://${host}:7512/nyc-open-data/yellow-taxi/_publish`,
  body: {
    message: 'end'
  },
  json: true
};

const doIt = async () => {
  try {
    await rp(options);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
  }
};
doIt();
