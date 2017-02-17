module.exports = Object.assign( { }, require('../lib/MyObject'), {
    
    Db: require('./lib/Db'),

    Jwt: require('./lib/Jwt'),

    Postgres: require('../dal/Postgres'),

    Response: require('./lib/Response'),

    apply( method ) {
        return this.Jwt.parseToken( this.parseCookies( this.request.headers.cookie ) )
        .then( user => {
            if( Object.keys( user ).length === 0 ) return this.respond( { stopChain: true, code: 401 } )
            this.user = user
            this.query = qs.length ? JSON.parse( decodeURIComponent( this.qs ) ) : { }
            return this.Db.apply( this )
        } )
        .then( result => this.Response.apply( this, result ) )
    },

    end( data ) {
        return new Promise( resolve => {
            data.body = JSON.stringify( data.body )
            this.response.writeHead( data.code || 200, Object.assign( this.getHeaders( data.body ), data.headers || {} ) )
            this.response.end( data.body )
            resolve()
        } )
    },

    getHeaders( body ) { return Object.assign( {}, this.headers, { 'Date': new Date().toISOString(), 'Content-Length': Buffer.byteLength( body ) } ) },

    headers: {
        'Connection': 'Keep-Alive',
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Keep-Alive': 'timeout=50, max=100'
    },

    parseCookies( cookies ) {
        var rv

        if( ! cookies ) return ''

        cookies.split(';').forEach( cookie => {
            var parts = cookie.split('='),
                name = parts.shift().trim()

            if( name === process.env.COOKIE ) rv = parts.join('=')
        } )

        return rv
    },

    respond( data ) {
        if( typeof data.body !== 'string' ) data.body = JSON.stringify( data.body || {} )

        this.response.writeHead( data.code || 200, Object.assign( this.getHeaders( data.body ), data.headers || {} ) )
        this.response.end( data.body )
        if( data.stopChain ) { throw new Error("Handled") }
    },

    slurpBody() {
        return new Promise( ( resolve, reject ) => {
            var body = ''
            
            this.request.on( "data", data => {
                body += data

                if( body.length > 1e10 ) {
                    response.request.connection.destroy()
                    reject( new Error("Too many bits") )
                }
            } )

            this.request.on( "end", () => {
                try { resolve(this.body = JSON.parse( body )) }
                catch( e ) { reject( 'Unable to parse request : ' + e ) }
            } )
        } )
    },
} )
