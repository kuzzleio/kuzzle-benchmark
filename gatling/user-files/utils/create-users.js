const
  rp = require('request-promise'),
  host = process.argv[2] || 'localhost';

const doit = (id) => {
  for (let it = 1; it < 100; ++it, ++id) {  
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
  let id = 1;
  for (let it = 1; it <= 20; ++it) {
    try {
      await doit(id);
      id += 100;
    }
    catch (error) {
      // eslint-disable-next-line no-console
      console.error(error.message);
    }
  } 
};
create_users();