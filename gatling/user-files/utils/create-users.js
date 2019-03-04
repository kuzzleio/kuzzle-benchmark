const
  rp = require('request-promise'),
  host = process.argv[2] || 'localhost';

const doit = startingId => {
  for (let id = startingId || 1; id < startingId + 100; ++id) {  
    try {
      let options = {
        method: 'POST',
        uri: `http://${host}:7512/users/${id}/_create?refresh=wait_for`,
        body: {
          'content': {
            'profileIds': ['default'],
            'fullname': 'John Doe'
          },
          'credentials': {
            'local': {
              username: id,
              password: 'test'
            }
          }
        },
        forever: true,
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
const create_users = async () => {
  const usersBundleSize = 100;
  for (let it = 0; it < 20; ++it) {
    try {
      await doit(usersBundleSize * it);
    }
    catch (error) {
      // eslint-disable-next-line no-console
      console.error(error.message);
    }
  } 
};
create_users();