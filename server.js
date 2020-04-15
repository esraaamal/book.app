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
app.get('/searches/new', newFiles);
app.post('/searches', getDataApi);
app.get('/books/:id',selecTwo);
app.post('/books/:id-add',saveBook);




app.get('/home' ,(req,res)=>{

    res.render('new');
})

app.get('/listBook',(req,res)=>{
    res.render('show');
})


function newFiles(req, res) {
    res.render('new');
}

function getSqlData(req, res) {
    let SQL = 'SELECT * FROM myBooks ;';
    return client.query(SQL)
        .then(results => {
            res.render('index', { data: results.rows });
        })
}


function selecTwo(req, res) {
    let parCode = req.params.val-id;
    let SQL = 'SELECT * FROM myBooks WHERE id=$1;';
    let safeValue = [parCode];
    return client.query(SQL, safeValue)
        .then(results => {
            res.render('details', { task: results.rows[0] })
        })
}


function saveBook(req,res){
    let parCode = req.params.id-add;
    let SQL = 'SELECT * FROM addBooks WHERE id=$1;';
let safeValue =[parCode];
return client.query(SQL ,safeValue)
.then(results =>{
    res.render('add', {data:results.rows})
});


}






function getDataApi(req,res) {
//   let array=[];
    console.log('Get Request->  ', req.body);
    if (req.body.select === 'title') {
        let title = req.body.q;
        let url = `https://www.googleapis.com/books/v1/volumes?q=intitle:${title}`;
        return superagent.get(url)
            .then(val => {
                let dataBooks = val.body;
               let array= dataBooks.items.map(val => {
                    let newBook = new Book(val);
                    getDataBase(newBook, res, req);
                    array.push(newBook);
                    // return  newBook;
                    return new Book(val);


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
              let array= dataBooks.items.map(val => {
                  let newBook = new Book(val);
                // return new Book(val);
                    getDataBase(newBook, res, req);
                    array.push(newBook);
                    return  newBook;


                })
                res.render('show', { data: array, author: author });
            })
            .catch(error => {
                res.render('error');
            });
    }
}


function  getDataBase(newBook,reg, res) {

    let SQL = 'INSERT INTO myBooks (title,authors,image,description ,bookshelf,ISBN) VALUES ($1,$2,$3,$4,$5,$6);';
    let safeValues = [newBook.title, newBook.authors, newBook.image, newBook.description,newBook.bookshelf,newBook.ISBN];
    return client.query(SQL, safeValues)
    .then(() => {
        res.redirect('/');
    })


    }
  





function Book(data) {
    this.title = data.volumeInfo.title || 'title book';
    this.image = data.volumeInfo.imageLinks.thumbnail || 'https://www.freeiconspng.com/uploads/book-icon--icon-search-engine-6.png';
    this.authors = data.volumeInfo.authors || [];
    this.description = data.volumeInfo.description || 'no description';
    this.bookshelf = data.volumeInfo.categories || [];
    this.ISBN = data.volumeInfo.industryIdentifiers[0].type || [];
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


    