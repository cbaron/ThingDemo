CREATE TABLE futurevent (
   "sensorId"     INTEGER REFERENCES sensor (id),
   data           TEXT,
   created        TIMESTAMP WITH TIME ZONE
);
