CREATE TABLE person (
   id             SERIAL PRIMARY KEY,
   name           VARCHAR(50),
   email          VARCHAR(100),
   password       TEXT
);

CREATE TABLE role (
   id             SERIAL PRIMARY KEY,
   name           VARCHAR(50)
);

CREATE TABLE membership (
   id             SERIAL PRIMARY KEY,
   "personId"     INTEGER REFERENCES person (id),
   "roleId"      INTEGER REFERENCES role (id)
);
