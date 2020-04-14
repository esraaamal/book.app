DROP TABLE IF EXISTS myBooks;
DROP TABLE IF EXISTS addBooks;

CREATE TABLE myBooks (
   id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    authors VARCHAR(255),
    image VARCHAR(255),
    description TEXT ,
    bookshelf VARCHAR(255),
    ISBN VARCHAR(255)

);

CREATE TABLE addBooks (
   id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    authors VARCHAR(255),
    image VARCHAR(255),
    description TEXT ,
    bookshelf VARCHAR(255),
    ISBN VARCHAR(255)

);