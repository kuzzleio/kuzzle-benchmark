var rp = require('request-promise');
const fs = require('fs');
const args = process.argv.slice(2);
let i = parseInt(args[0]);

var options = {
    method: 'POST',
    uri: 'http://localhost:7512/nyc-open-data/yellow-taxi/_create',
    body: {
        "user": "yo", 
        "pwd":"nodenodenode"
    },
    json: true
};
 
var tab_ids = [];
const retrieve_ids = async () => {
    for (; i > 0; i--) {
        try {
            const parsedBody = await rp(options)            
            tab_ids.push(parsedBody["result"]._id)
        } catch (error) {
            
        }
    }
    fs.writeFileSync('./ids.txt', JSON.stringify(tab_ids).replace(/,/g, ', '));
}
retrieve_ids();