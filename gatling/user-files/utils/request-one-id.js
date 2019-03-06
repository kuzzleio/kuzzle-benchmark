const 
  rp = require('request-promise'),
  fs = require('fs');

const host = process.argv[2] || 'localhost';
const options = {
  method: 'POST',
  uri: `http://${host}:7512/nyc-open-data/yellow-taxi/_create`,
  body: {
    user: 'yo',
    pwd: 'nodenodenode'
  },
  json: true
};

const retrieve_id = async () => {
  try {
    const parsedBody = await rp(options);
    fs.writeFileSync('./id.txt', parsedBody.result._id);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
  }
};
retrieve_id();