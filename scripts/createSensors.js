#!/usr/bin/env node

require('node-env-file')( `${__dirname}/../.env` )

const ColumnFixture = require('../fixture/ColumnFixture')

const Postgres = require('../dal/Postgres'),
      Moment = require('moment'),
      count = parseInt( process.argv[2] ),
      networkId = process.argv[3]

Postgres.initialize()
.then( () =>
    Promise.all(
        Array.from( Array( count ).keys() ).map( () =>
            ColumnFixture( Postgres.tables.sensor.columns.find( column => column.name === 'location' ) )
            .then( location => Postgres.query( `INSERT INTO sensor ( "networkId", location ) VALUES ( ${networkId}, ST_Makepoint( ${location[0]}, ${location[1]} ) )` ) )
        )
    )
)
.catch( e => console.log( e.stack || e ) )
.then( () => process.exit(0) )
