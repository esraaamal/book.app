`use strict`;

// Load Environment Variables from the .env file
require('dotenv').config();

// Application Dependencies
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
// const pg= require('pg');





const PORT = process.env.PORT || 3000;
// const client =new pg.Client(process.env.DATABASE_URL);
const app = express();
app.use(cors());


app.listen(PORT, () => {
    console.log('listening on port', PORT);
});