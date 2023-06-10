// config/database.js
require("dotenv").config();

const url = process.env.URI

module.exports = {

    'url' : `${url}`, 
    'dbName': 'demo'
};
