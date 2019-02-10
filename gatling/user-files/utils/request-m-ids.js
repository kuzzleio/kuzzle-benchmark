const 
  rp = require('request-promise'),
  fs = require('fs');

const host = process.argv[2] || 'localhost';
const doc = {
  body: {
    driver: {
      name: 'Eltooooon',
      age: 42,
      license: 'B'
    },

    car: {
      position: {
        lat: 42.83734827,
        lng: 8.298382039
      },
      type: 'berline'
    }
  }
};
const docs = [];
for (let it = 0; it < 200; it++) {docs.push(doc);}
const content = JSON.parse(`{ "documents": ${JSON.stringify(docs)}}`);
const options = {
  method: 'POST',
  uri: `http://${host}:7512/nyc-open-data/yellow-taxi/_mCreate`,
  body: content,
  json: true
};

const retrieve_ids = async () => {
  try {
    const parsedBody = await rp(options);
    const tab_ids = parsedBody.result.hits.map(hit => hit._id);
    fs.writeFileSync('./ids.txt', JSON.stringify(tab_ids).replace(/,/g, ', '));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
  }
  
};
retrieve_ids();
