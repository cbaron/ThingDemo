#!/usr/bin/env node

require('node-env-file')( `${__dirname}/../.env` )

function getRandomInt( min, max ) { return Math.floor(Math.random() * (max - min + 1)) + min }

const Postgres = require('../dal/Postgres'),
      Moment = require('moment'),
      Stochastic = require('stochastic'),
      start = Moment.utc( process.argv[2] ),
      end = Moment.utc( process.argv[3] )

Postgres.query( `SELECT * FROM sensor` )
.then( result => {
    let sensors = result.rows.map( row => Object.assign( row, { events: [ ], isDone: false } ) ),
        done = false

    while( ! done ) {
        sensors.forEach( sensor => {
            const lastEvent = sensor.events.length ? sensor.events[ sensor.events.length - 1 ] : start,
                  currentEvent = Moment( lastEvent ).add( Stochastic.norm( 10, 3getRandomInt( 1, 480 ), 'm' )
            sensor.events.push( Moment( lastEvent ).add( getRandomInt( 1, 480 ), 'm' ) )
        count--
    }

    return Promise.all( sensors.map( sensor =>
        Promise.all( sensor.events.map( ( moment, i ) =>
            Postgres.query( `INSERT INTO event( "sensorId", data, created ) VALUES ( ${sensor.id}, '${ JSON.stringify( { isAvailable: Boolean( i % 2 ) } ) }', '${moment.toISOString()}' )` )
        ) )
    ) )
} )
.catch( e => console.log( e.stack || e ) )
.then( () => process.exit(0) )
