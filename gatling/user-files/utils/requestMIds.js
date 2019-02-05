const rp = require('request-promise');
const fs = require('fs');
let i = parseInt(process.argv[2]) || 1;

const options = {
    method: 'POST',
    uri: 'http://localhost:7512/nyc-open-data/yellow-taxi/_create',
    body: {
        "user": "yo", 
        "pwd":"nodenodenode"
    },
    json: true
};
 
const tab_ids = [];
const retrieve_ids = async () => {
    for (; i > 0; i--) {
        try {
            const parsedBody = await rp(options)            
            tab_ids.push(parsedBody.result._id)
        } catch (error) {
            console.log(error);
        }
    }
    fs.writeFileSync('./ids.txt', JSON.stringify(tab_ids).replace(/,/g, ', '));
}
retrieve_ids();
