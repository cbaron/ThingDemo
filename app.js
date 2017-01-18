require('node-env-file')( __dirname + '/.env' )

require('./dal/Postgres').initialize()
.then( () => {
    console.log('DAL cached')
    require('http').createServer( require('./router') ).listen( process.env.PORT || 80 )
    console.log( `An http server is running at port ${process.env.PORT || 80}` )
    return Promise.resolve()
} )
.catch( e => console.log( `Error starting server: ${e.stack || e} ` ) )

