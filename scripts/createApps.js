#!/usr/bin/env node

require('node-env-file')( `${__dirname}/../.env` )

function getRandomInt( min, max ) { return Math.floor(Math.random() * (max - min + 1)) + min }
function getRandomFloat( min, max ) { return Math.random() * (max - min) + min }

function insertApp( row ) {
    return Postgres.query( `INSERT INTO app ( "deploymentId", created ) VALUES ( ${ row.deploymentId }, '${row.created.toISOString()}' )` )
}

function insertSensors( deploymentId, created ) {
    const deploymentCenter = [ getRandomFloat( -180, 180 ), getRandomFloat( -90, 90 ) ],
          sensorCount = getRandomInt( 100, 1000 ),
          locations = [ Stochastic.norm( deploymentCenter[0], 2, sensorCount ), Stochastic.norm( deploymentCenter[1], 2, sensorCount ) ]

    return Promise.all(
        Array.from( Array( sensorCount ).keys() ).map( i =>
            Postgres.query(
                `INSERT INTO sensor ( location, "networkId", "isActive", "deploymentId", created ) ` +
                `VALUES ( ST_MakePoint( ${locations[0][i]}, ${locations[1][i]} ), ${networkId}, ${ Boolean( getRandomInt( 1, 100 ) !== 100 ) }, ${ deploymentId }, '${ created.toISOString() }' )`
            )
        )
    )
}

const Postgres = require('../dal/Postgres'),
      Stochastic = require('stochastic'),
      Moment = require('moment'),
      start = Moment.utc( process.argv[2] )
      end = Moment.utc( process.argv[3] )

let current = start,
    networkId = undefined,
    deployments = [ ],
    chain = Promise.resolve()

while( end.isAfter( current ) ) {

    chain = chain.then( () =>
        Postgres.query( `SELECT id FROM deployment WHERE created < '${ current.toISOString() }'` )
        .then( result => {
            const deploymentIds = result.rows.map( row => row.id ),
                  appCount = Math.round( Math.abs( Stochastic.norm( deploymentIds.length * 2, deploymentIds.length, 1 ) ) ),
                  scopeDate = current.toDate().getTime()

            return Promise.all(
                Array.from( Array( appCount ).keys() ).map( () =>
                    insertApp( {
                        deploymentId: deploymentIds[ getRandomInt( 0, deploymentIds.length -1 ) ],
                        created: new Date( scopeDate + ( getRandomInt( 0, 23 ) * getRandomInt( 0, 60 ) * getRandomInt( 0, 60 ) * 1000 ) )
                    } )
                )
            )
        } )
    )

    current.add( 1, 'days' )
}

chain.catch( e => { console.log( e.stack || e ); process.exit(1) } )
.then( () => process.exit(0) )
