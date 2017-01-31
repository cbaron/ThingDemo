#!/usr/bin/env node

require('node-env-file')( `${__dirname}/../.env` )

function getRandomInt( min, max ) { return Math.floor( Math.random() * (max - min + 1 ) ) + min }

function insert( row ) {
    return Postgres.query( `INSERT INTO event ( data, "sensorId", created ) VALUES ( '${ JSON.stringify( row.data ) }', ${row.sensorId}, '${row.created.toISOString()}' )` )
    .then( () => { Io.emit( 'eventCreated', { data: row.data, sensorId: row.sensorId } ); return Promise.resolve() } )
}

function determineFuture( sensorId, event ) {
  return ( event
    ? Promise.resolve(event)
    : Postgres.query(
        `SELECT e.data FROM event e ` +
        `JOIN ( SELECT "sensorId", MAX( created ) as created FROM event WHERE "sensorId" = ${sensorId} GROUP BY "sensorId" ) e2 ` +
        `ON e."sensorId" = e2."sensorId" AND e.created = e2.created` ).then( result => ( { data: result.rows[0].data } ) )
  ).then( event => {
      const data = { isAvailable: !event.data.isAvailable },
            created = new Date( new Date().getTime() + ( getRandomInt( 1, 25 ) * 60 * 1000 ) + ( getRandomInt( 1, 60 ) * 1000 ) )
      futureEvents[ sensorId ] = { sensorId, data, created }
      return Promise.resolve( created.getTime() )
  } )
}

function app( sleepTime ) {
    setTimeout( () => {
        const now = new Date().getTime()
        let newSleepTime = Infinity

        return Postgres.query( `SELECT id FROM sensor ORDER BY id` )
        .then( sensor =>
            Promise.all(
                sensor.rows.map( sensor => {
                    const event = futureEvents[ sensor.id ],
                          created = event ? event.created.getTime() : undefined
                          toFire = Boolean( event && ( created < now ) )

                   
                    if( toFire ) {
                        return insert( event )
                        .then( () => determineFuture( sensor.id, event ) } )
                        .then( created => Promise.resolve( newSleepTime = ( created < newSleepTime ) ? created : newSleepTime ) )
                    } else if( event === undefined ) {
                        return determineFuture( sensor.id, event )
                        .then( created => Promise.resolve( newSleepTime = ( created < newSleepTime ) ? created : newSleepTime ) )
                    } else {
                        return Promise.resolve( newSleepTime = ( created < newSleepTime ) ? created : newSleepTime )
                    }
                } )
            )
            .then( () => Promise.resolve( newSleepTime ) )
        )
        .then( newSleepTime => {
            return Promise.resolve( app( newSleepTime - now ) )
        } )
        .catch( e => { console.log( e.stack || e ); process.exit(1) } )
    }, sleepTime )
}

const Io = require('socket.io-client')(`http://${process.env.DOMAIN}:${process.env.PORT}`),
      Postgres = require('../dal/Postgres')
      maxMinutes = 30,
      futureEvents = { };

app(0);
