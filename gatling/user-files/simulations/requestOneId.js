var rp = require('request-promise');
const fs = require('fs');

var options = {
    method: 'POST',
    uri: 'http://localhost:7512/nyc-open-data/yellow-taxi/_create',
    body: {
        "user": "yo", 
        "pwd":"nodenodenode"
    },
    json: true
};


const retrieve_id = async () => {
    try {
        const parsedBody = await rp(options)
        fs.writeFileSync('./id.txt', parsedBody["result"]._id)
    } catch (error) {            
    }
}
retrieve_id();