DROP TABLE IF EXISTS myBooks;

CREATE TABLE myBooks (
   id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    authors VARCHAR(255),
    image VARCHAR(255),
    description TEXT

);

    