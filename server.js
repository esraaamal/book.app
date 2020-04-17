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


app.get('/new', (req, res) => {
    res.render('new');
})


/////////////////////////////////////
app.get('/', getSqlData);
app.get('/searches/new', newFiles);//call the form
app.post('/books',inserApitData);//insert the data in table myBooks
app.post('/searches', getDataApi);
app.get('/books/:id-task', viewDetailes);
app.post('/add',addData);
   


function newFiles(req, res) {
    res.render('new');
}

function addData(req, res){

    res.render('add',{data:req.body});

   }




function getSqlData(req, res) {
    let SQL = 'SELECT * FROM myBooks ;';
    return client.query(SQL)
        .then(results => {
            res.render('index', { data: results.rows });
        })
}


function viewDetailes(req, res) {
    let SQL = 'SELECT * FROM myBooks WHERE id=$1;';
    let safeValue = [req.params.id-task];
    return client.query(SQL, safeValue)
        .then(results => {
            res.render('details', { data: results.rows[0] });
        });
        console.log(data);

}









function getDataApi(req, res) {
    //   let array=[];
    console.log('Get Request->  ', req.body);
    if (req.body.select === 'title') {
        let title = req.body.q;
        let url = `https://www.googleapis.com/books/v1/volumes?q=intitle:${title}`;
        return superagent.get(url)
            .then(val => {
                let dataBooks = val.body;
                let array = dataBooks.items.map(val => {
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
                let array = dataBooks.items.map(val => {
                    return new Book(val);

                })
                res.render('show', { data: array, author: author });
            })
            .catch(error => {
                res.render('error');
            });
    }
}



function inserApitData(req,res){
    let {image ,title,authors, description,bookshelf,ISBN}=req.body;
    let SQL = 'INSERT INTO myBooks (title,authors,image,description ,bookshelf,ISBN) VALUES ($1,$2,$3,$4,$5,$6);';
    let safeValues = [title, authors, image, description,bookshelf,ISBN];
return client.query(SQL,safeValues)
.then(()=>{
    res.redirect('/')
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


