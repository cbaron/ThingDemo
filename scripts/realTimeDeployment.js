#!/usr/bin/env node

require('node-env-file')( `${__dirname}/../.env` )

const stochastic = require('stochastic')
    meanHour = 24,
    standardDeviation = 12
    
let nextDeployment = undefined

function insertDeployment( row ) {
    return Postgres.query( `INSERT INTO deployment ( created ) VALUES ( '${row.created.toISOString()}' )` )
    .then( () => { Io.emit( 'deploymentCreated', { } ); return Promise.resolve() } )
}

function determineFuture( lastDeployment ) {
  return ( ( lastDeployment )
    ? Promise.resolve( lastDeployment )
    : Postgres.query( `SELECT MAX( created ) FROM deployment` ).then( result => Promise.resolve( result.rows[0].max ) )
  ).then( lastDeployment => {
      const nextDeployment = lastDeployment + stochastic.norm( meanHour, standardDeviation )[0] * 60 * 60 * 1000
            created = new Date( new Date().getTime() + ( getRandomInt( 1, 10 ) * 60 * 1000 ) + ( getRandomInt( 1, 60 ) * 1000 ) )
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
                        .then( () => determineFuture( sensor.id, event ) )
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
        .then( newSleepTime => Promise.resolve( app( newSleepTime - now ) ) )
        .catch( e => { console.log( e.stack || e ); process.exit(1) } )
    }, sleepTime )
}

const Io = require('socket.io-client')(`http://${process.env.DOMAIN}:${process.env.PORT}`),
      Postgres = require('../dal/Postgres')
      maxMinutes = 30,
      futureEvents = { };

app(0);
