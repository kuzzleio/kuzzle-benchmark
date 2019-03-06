const
  rp = require('request-promise'),
  host = process.argv[2] || 'localhost',
  config = require('./config');

const doit = async startingId => {
  for (let id = startingId || 1; id < startingId + config.usersBundleSize; ++id) {  
    try {
      let options = {
        method: 'DELETE',
        uri: `http://${host}:7512/users/${id}?refresh=wait_for`,
        json: true
      };
      rp(options);
    }
    catch (error) {
      // eslint-disable-next-line no-console
      console.error(error.message);
    }
  }
};
const delete_users = async () => {
  try {
    for (let it = 0; it < 20; ++it) {
      await doit(config.usersBundleSize * it);
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error.message);
  }
};
delete_users();