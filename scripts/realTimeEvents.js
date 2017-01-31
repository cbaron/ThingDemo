#!/usr/bin/env node

require('node-env-file')( `${__dirname}/../.env` )

const Io = require('socket.io-client')(`http:${process.env.DOMAIN`),
      Postgres = require('../dal/Postgres')
      now = new Date().getTime(),
      maxMinutes = 30

getRandomPercentile => Math.floor( Math.random() * 100 )

insert = row => Postgres.query( `INSERT INTO event ( data, "sensorId", created ) VALUES ( '${ row.data }`, ${row.sensorId}, ${row.created} )` )
                .then( () => Io.emit( 'eventCreated', { JSON.parse( data ), sensorId: row.sensorId } )
                .catch( e => `Error creating event ${ e.stack || e }` )

determineFuture = ( sensorId, event ) => ( event )
    ? Postgres.query( `SELECT

}

                
    Promise.all( [
        Postgres.query( `SELECT id FROM sensor ORDER BY id` ),
        Postgres.query( `SELECT * FROM futurevents ORDER BY "sensorId"` )
    ] )
    .then( ( [ sensor, futurevents ] ) =>
        Promise.all(
            sensor.rows.map( sensor => {
                const event = futurevents.rows.find( row => row.sensorId === sensor.id ),
                      toFire = Boolean( event && new Date( event.created ).getTime() < now )
                
                if( toFire ) insert( event )
                            
                if( event === undefined || toFire ) determineFuture( sensor.id, event )
            } )
            
            result.rows.map( row =>e.data, e."sensorId", e.created FROM event e JOIN ( SELECT "sensorId", MAX( created ) as created FROM event GROUP BY "sensorId" ) e2 ON e."sensorId" = e2."sensorId" AND e.created = e2.created` )

    Postgres.query( `SELECT e.data, e."sensorId", e.created FROM event e JOIN ( SELECT "sensorId", MAX( created ) as created FROM event GROUP BY "sensorId" ) e2 ON e."sensorId" = e2."sensorId" AND e.created = e2.created` )
    .then( result =>
        result.rows.forEach( row => {
            const diff = Math.floor( ( ( now - new Date( row.created ).getTime() ) / 1000 ) * 60 )

            if( ( diff > 25 ) || ( ( diff * 4 ) > getRandomPercentile() ) ) insert( row )
        } )
    )
            



const Postgres = require('../dal/Postgres'),
      Moment = require('moment'),
      start = Moment.utc( process.argv[3] )

let count = process.argv[2]

Postgres.query( `SELECT * FROM sensor` )
.then( result => {
    let sensors = result.rows.map( row => Object.assign( row, { events: [ ] } ) )

    while( count > 0 ) {
        let sensor = sensors[ Math.floor( Math.random() * sensors.length ) ]
        const lastEvent = sensor.events.length ? sensor.events[ sensor.events.length - 1 ] : start
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
