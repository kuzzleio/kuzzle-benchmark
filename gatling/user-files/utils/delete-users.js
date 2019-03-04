const
  rp = require('request-promise'),
  host = process.argv[2] || 'localhost';

const doit = async startingId => {
  for (let id = startingId || 1; id < startingId + 100; ++id) {  
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
    const usersBundleSize = 100;
    for (let it = 0; it < 20; ++it) {
      await doit(usersBundleSize * it);
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error.message);
  }
};
delete_users();