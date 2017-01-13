CREATE EXTENSION Postgis;

CREATE TABLE network (
   id             SERIAL PRIMARY KEY,
   name           VARCHAR(30),
   label          VARCHAR(50)
);

CREATE TABLE sensor (
   id             SERIAL PRIMARY KEY,
   location       GEOGRAPHY(POINT,4326),
   "networkId"    INTEGER REFERENCES network (id)
);

CREATE TABLE event (
   id             SERIAL PRIMARY KEY,
   "sensorId"     INTEGER REFERENCES sensor (id),
   data           TEXT,
   created        TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
