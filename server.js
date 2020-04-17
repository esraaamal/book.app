'use strict';

require('dotenv').config();
const express = require('express');
const superagent = require('superagent');
const PORT = process.env.PORT || 3030;
const app = express();
const methodOverride = require('method-override');
const bodyParser = require('body-parser');
var path = require('path');
const pg = require('pg');

const client = new pg.Client(process.env.DATABASE_URL);


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
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
app.get('/book/:task_id', viewDetailes);
app.post('/add',addData);
app.put('/update/:task_id' ,updatetask)
app.delete('/delete/:task_id', deleteBook);



function deleteBook(req ,res){
    let SQL = 'DELETE FROM myBooks WHERE id=$1';
    let value = [req.params.task_id];
    client.query(SQL, value)
    .then(res.redirect('/'))

}



function updatetask(req,res){
    let { title, image,authors ,description} = req.body;
    let SQL = 'UPDATE myBooks SET title=$1,image=$2,authors=$3,description=$4 WHERE id=$5;';
    let safeValues = [title, image,authors ,description, req.params.task_id];
    client.query(SQL, safeValues)
    .then(res.redirect(`/book/${req.params.task_id}`))
}







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
    let safeValue = [req.params.task_id];
    return client.query(SQL, safeValue)
        .then(results => {
            res.render('details', { data: results.rows[0] });
        });
        
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


