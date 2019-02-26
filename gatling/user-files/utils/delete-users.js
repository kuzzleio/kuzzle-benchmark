const
  rp = require('request-promise'),
  host = process.argv[2] || 'localhost';

const doit = async (id) => {
  for (let it = 1; it < 100; ++it, ++id) {  
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
    let id = 1;
    for (let it = 1; it <= 20; ++it) {
      await doit(id);
      id += 100;
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error.message);
  }
};
delete_users();