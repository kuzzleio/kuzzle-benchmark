const rp = require('request-promise');
const fs = require('fs');
let count = parseInt(process.argv[2]) || 1;

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
const content = JSON.parse('{ "documents": ' + JSON.stringify(docs) + '}');
const options = {
  method: 'POST',
  uri: 'http://localhost:7512/nyc-open-data/yellow-taxi/_mCreate',
  body: content,
  json: true
};

const tab_ids = [];
const retrieve_ids = async () => {
  for (; count > 0; count--) {
    try {
      const parsedBody = await rp(options);
      for (let it = 0; parsedBody.result.hits[it]; ++it)
      {tab_ids.push(parsedBody.result.hits[it]._id);}
    } catch (error) {
      console.error(error);
    }
  }
  fs.writeFileSync('./ids.txt', JSON.stringify(tab_ids).replace(/,/g, ', '));
};
retrieve_ids();
