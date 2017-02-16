#!/usr/bin/env node

require('node-env-file')( `${__dirname}/../.env` )

function getRandomInt( min, max ) { return Math.floor(Math.random() * (max - min + 1)) + min }

const Postgres = require('../dal/Postgres'),
      Moment = require('moment'),
      Stochastic = require('stochastic'),
      start = Moment.utc( process.argv[2] ),
      end = Moment.utc( process.argv[3] ),
      norms = Stochastic.norm( 360, 15, 100 )
    
Postgres.query( `SELECT * FROM sensor` )
.then( result => {
    let sensors = result.rows.map( row => Object.assign( row, { lastEvent: undefined, isDone: false } ) ),
        done = false
        
    while( ! done ) {
        done = true
        sensors.forEach( sensor => {
            if( sensor.isDone ) return

            const lastEvent = sensor.lastEvent || Moment( sensor.created ),
                  currentEvent = Moment( lastEvent ).add( norms[ getRandomInt( 0, 99 ) ], 'm' )
    
            if( currentEvent.isBefore( end ) ) {
                done = false
                sensor.lastEvent = currentEvent
                Postgres.query( `INSERT INTO event( "sensorId", data, created ) VALUES ( ${sensor.id}, '${ JSON.stringify( { isAvailable: true } ) }', '${currentEvent.toISOString()}' )` )
                .catch( e => { console.log( e.stack || e ); process.exit(1) } )
            } else { sensor.isDone = true }
        } )
    }
} )
.catch( e => { console.log( e.stack || e ); process.exit(1) } )
