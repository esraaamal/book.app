'use strict';

require('dotenv').config();
const express = require('express');
const superagent = require('superagent');
const PORT = process.env.PORT || 3030;
const app = express();
const bodyParser = require('body-parser');
var path = require('path');
const pg = require('pg');

const client = new pg.Client(process.env.DATABASE_URL);


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser());
app.set('view engine', 'ejs');

app.use(express.static('./public'));
app.set('views', [path.join(__dirname, 'views'),
path.join(__dirname, 'views/pages/'),
path.join(__dirname, 'views/pages/searches/'),
path.join(__dirname, 'views/pages/books/')]);
//////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////



app.get('/', getSqlData);
app.get('/searches/new', newFiles)
app.get('/detail/:val-id', selecTwo);
app.post('/searches', getDataApi);





function newFiles(req, res) {
    res.render('new');
}

function getSqlData(req, res) {
    let SQL = 'SELECT * FROM myBooks ;';
    return client.query(SQL)
        .then(results => {
            res.render('index', { taskResults: results.rows });
        })
}


function selecTwo(req, res) {
    let parCode = req.params.val - id;
    let SQL = 'SELECT * FROM myBooks WHERE id=$1;';
    let safeValue = [parCode];
    return client.query(SQL, safeValue)
        .then(results => {
            res.render('details', { task: results.rows[0] })
        })
}









function getDataApi(req,res) {
  let newArr=[];
    console.log('Get Request->  ', req.body);
    if (req.body.select === 'title') {
        let title = req.body.q;
        let url = `https://www.googleapis.com/books/v1/volumes?q=intitle:${title}`;
        return superagent.get(url)
            .then(val => {
                let dataBooks = val.body;
                let array = dataBooks.items.map(val => {
                    let newBook = new Book(val);
                    getDataBase(newBook, res, req);
                    newArr.push(newBook);
                    return  newArr;

                })
                res.render('show', { data: array, title: title });
            })
            .catch(error => {
                res.render('error');
            });
    }
    else if (req.body.select === 'author') {
        let author = req.body.q;
        console.log(author);
        let url = `https://www.googleapis.com/books/v1/volumes?q=inauthor:${author}`;
        superagent.get(url)
            .then(val => {
                let dataBooks = val.body;
                let array = dataBooks.items.map(val => {
                    let newBook = new Book(val);

                    newArr.push(newBook);
                    getDataBase(newBook, res, req);
                    return  newArr;


                })
                res.render('show', { data: array, author: author });
            })
            .catch(error => {
                res.render('error');
            });
    }
}


function  getDataBase(newBook, req, res) {

    let SQL = 'INSERT INTO myBooks (title,authors,image,description) VALUES ($1,$2,$3,$4);';
    let safeValues = [newBook.title, newBook.authors, newBook.image, newBook.description];
    return client.query(SQL, saveValue)
        .then(results => {
           res.redirect('/')
        });


    }






function Book(data) {
    this.title = data.volumeInfo.title || 'title book';
    this.image = data.volumeInfo.imageLinks.thumbnail || 'https://www.freeiconspng.com/uploads/book-icon--icon-search-engine-6.png';
    this.authors = data.volumeInfo.authors || [];
    this.description = data.volumeInfo.description || 'no description';
    this.bookshelf = data.volumeInfo.categories || [];
    this.this.ISBN = data.volumeInfo.industryIdentifiers[0].type || [];
}

app.get('*', (req, res) => {
    res.render('error');
});



client.connect()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`listen to ${PORT}`);
        });

    })

