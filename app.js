require('node-env-file')( __dirname + '/.env' )
      
require('http').createServer( require('./router') ).listen( process.env.PORT || 80 )

console.log( `An http server is running at port ${process.env.PORT || 80}` )
