const rp = require('request-promise');

const host = process.argv[2] || 'localhost';

const create_users = async () => {
  try {
    for (let name = 1; name < 2000; name++) {

      let options = {
        method: 'POST',
        uri: `http://${host}:7512/users/_create`,
        body: {
          'content': {
            'profileIds': ['default'],
            'fullname': 'John Doe'
          },
          'credentials': {
            'local': {
              username: name,
              password: 'test'
            }
          }
        },
        json: true
      };
      await rp(options);
    } 
  }
  catch (error) {
    // eslint-disable-next-line no-console
    console.error(error.message);
  }  
};

create_users();