#!/usr/bin/env node

require('node-env-file')( `${__dirname}/../.env` )

const stochastic = require('stochastic')
      Io = require('socket.io-client')(`http://${process.env.DOMAIN}:${process.env.PORT}`),
      meanHour = 4,
      standardDeviation = 2,
      Postgres = require('../dal/Postgres')

let nextDeployment = determineFuture(),
    networkId = undefined
   
function getRandomInt( min, max ) { return Math.floor( Math.random() * (max - min + 1 ) ) + min }
function getRandomFloat( min, max ) { return Math.random() * (max - min) + min }

function insertDeployment( row ) {
    return Postgres.query( `INSERT INTO deployment ( created ) VALUES ( '${row.created.toISOString()}' ) RETURNING id, created` )
    .then( result => insertSensors( result.rows[0].id, result.rows[0].created ) )
    .then( () => { Io.emit( 'deploymentCreated', { } ); return Promise.resolve() } )
}

function insertSensors( deploymentId, created ) {
    const deploymentCenter = [ getRandomFloat( -180, 180 ), getRandomFloat( -90, 90 ) ],
          sensorCount = getRandomInt( 100, 1000 ),
          locations = [ stochastic.norm( deploymentCenter[0], 2, sensorCount ), stochastic.norm( deploymentCenter[1], 2, sensorCount ) ]

    return Promise.all(
        Array.from( Array( sensorCount ).keys() ).map( i =>
            Postgres.query(
                `INSERT INTO sensor ( location, "networkId", "isActive", "deploymentId", created ) ` +
                `VALUES ( ST_MakePoint( ${locations[0][i]}, ${locations[1][i]} ), ${networkId}, ${ Boolean( getRandomInt( 1, 100 ) !== 100 ) }, ${ deploymentId }, '${ created }' )`
            )
        )
    )
}

function determineFuture( lastDeployment ) {
    lastDeployment = lastDeployment || new Date().getTime()
    return lastDeployment + ( stochastic.norm( meanHour, standardDeviation ) * getRandomInt( 1, 60 ) * getRandomInt( 1, 60 ) * 1000 )
}

function app( sleepTime ) {
    setTimeout( () => {
        const now = new Date().getTime()

        if( now >= nextDeployment ) {
            insertDeployment( { created: new Date( nextDeployment ) } )
            .then( () => {
                nextDeployment = determineFuture( nextDeployment )
                Promise.resolve( app( nextDeployment - now ) )
            } )
            .catch( e => { console.log( e.stack || e ); process.exit(1) } )
        } else {
            Promise.resolve( app( nextDeployment - now ) )
        }
    }, sleepTime )
    console.log(`Sleeping for ${sleepTime / 1000}s`)
}

Postgres.query( `SELECT id FROM network WHERE name = 'vodafone'` )
.then( result => {
    networkId = result.rows[0].id
    app( nextDeployment - new Date().getTime() + 1000 )
} )
.catch( e => { console.log( e.stack || e ); process.exit(1) } )
