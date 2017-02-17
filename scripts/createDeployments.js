#!/usr/bin/env node

require('node-env-file')( `${__dirname}/../.env` )

function getRandomInt( min, max ) { return Math.floor(Math.random() * (max - min + 1)) + min }
function getRandomFloat( min, max ) { return Math.random() * (max - min) + min }

function insertDeployment( row ) {
    return Postgres.query( `INSERT INTO deployment ( "networkId", "subCategoryId", created ) VALUES ( ${networkId}, ${ row.subCategoryId }, '${row.created.toISOString()}' ) RETURNING id, created` )
    .then( result => insertSensors( result.rows[0].id, result.rows[0].created ) )
}

function insertSensors( deploymentId, created ) {
    const deploymentCenter = [ getRandomFloat( -180, 180 ), getRandomFloat( -90, 90 ) ],
          sensorCount = getRandomInt( 10, 100 ),
          locations = [ Stochastic.norm( deploymentCenter[0], 2, sensorCount ), Stochastic.norm( deploymentCenter[1], 2, sensorCount ) ]

    return Promise.all(
        Array.from( Array( sensorCount ).keys() ).map( i =>
            Postgres.query(
                `INSERT INTO sensor ( location, "isActive", "deploymentId", created ) ` +
                `VALUES ( ST_MakePoint( ${locations[0][i]}, ${locations[1][i]} ), ${ Boolean( getRandomInt( 1, 100 ) !== 100 ) }, ${ deploymentId }, '${ created.toISOString() }' )`
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
    deployments = [ ]

Promise.all( [
    Postgres.query( `SELECT id FROM network WHERE name = 'vodafone'` ),
    Postgres.query( `SELECT id FROM "subCategory"` ),
] )
.then( ( [ networkResult, subCategoryResult ] ) => {
    const subCategoryIds = subCategoryResult.rows.map( row => row.id )
    networkId = networkResult.rows[0].id
    
    while( end.isAfter( current ) ) {
        const deploymentCount = Math.round( Math.abs( Stochastic.norm( 5, Math.sqrt( 5 ), 1 ) ) ),
              scopeDate = current.toDate().getTime()

        Array.from( Array( deploymentCount ).keys() ).forEach( () =>
            deployments.push( {
                created: new Date( scopeDate + ( getRandomInt( 0, 23 ) * getRandomInt( 0, 60 ) * getRandomInt( 0, 60 ) * 1000 ) ),
                subCategoryId: subCategoryIds[ getRandomInt( 0, subCategoryIds.length - 1 ) ]
            } )
        )

        current.add( 1, 'days' )
    }

    return Promise.all( deployments.map( deployment => insertDeployment( deployment ) ) )
} )
.catch( e => { console.log( e.stack || e ); process.exit(1) } )
.then( () => process.exit(0) )
