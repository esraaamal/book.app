'use strict';

require('dotenv').config();
const express = require('express');
const superagent = require('superagent');
const PORT = process.env.PORT;
const app = express();
const bodyParser = require('body-parser');
var path =require('path');

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(bodyParser());
app.set('view engine' ,'ejs');

app.use(express.static('./public'));

app.set('views', [path.join(__dirname, 'views'),
                      path.join(__dirname, 'views/pages/'), 
                      path.join(__dirname, 'views/pages/searches/')]);


app.get('/hello',(req,res) =>{
res.render('index');
});






app.listen(PORT,()=>{
console.log(`listen to ${PORT}`);
});