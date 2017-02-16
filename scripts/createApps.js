#!/usr/bin/env node

require('node-env-file')( `${__dirname}/../.env` )

function getRandomInt( min, max ) { return Math.floor(Math.random() * (max - min + 1)) + min }
function getRandomFloat( min, max ) { return Math.random() * (max - min) + min }

function insertApp( row ) {
    return Postgres.query( `INSERT INTO app ( "deploymentId", created ) VALUES ( ${ row.deploymentId }, '${row.created.toISOString()}' )` )
    .catch( e => { console.log( e.stack || e ); process.exit(1) } )
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
    const scopeDate = current.toDate().getTime()

    Postgres.query( `SELECT id FROM deployment WHERE created < '${ current.toISOString() }'` )
    .then( result => {
        const deploymentIds = result.rows.map( row => row.id ),
              appCount = Math.round( Math.abs( Stochastic.norm( deploymentIds.length * 2, deploymentIds.length, 1 ) ) )

        Array.from( Array( appCount ).keys() ).forEach( () =>
            insertApp( {
                deploymentId: deploymentIds[ getRandomInt( 0, deploymentIds.length -1 ) ],
                created: new Date( scopeDate + ( getRandomInt( 0, 23 ) * getRandomInt( 0, 60 ) * getRandomInt( 0, 60 ) * 1000 ) )
            } )
        )
    } )

    current.add( 1, 'days' )
}
