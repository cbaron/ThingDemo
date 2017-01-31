module.exports = Object.create( Object.assign( { }, require('./lib/MyObject'), {
    constructor( app ) {
        this.io = require('socket.io')(app)

        console.log( `A socket-io server is running` )
        
        this.io.on( 'connection', socket => {

          socket.on( 'eventCreated', ( data, callback ) => {
              this.io.emit( 'eventCreatedCreated', data )
              callback()
          } )

          socket.on( 'apiMatch', ( data, callback ) => {
              this.io.emit( 'apiMatched', data )
              callback()
          } )

        } )
    }
} ) )
