module.exports = Object.assign( { }, require('../lib/MyObject'), {
    
    Jwt: require('./lib/Jwt'),

    Postgres: require('../dal/Postgres'),

    apply( method ) { return this.createChain( method ).callChain },

    createChain( method ) {
        var start
            
        this.callChain = new Promise( resolve => start = resolve );

        ( this[ method ] ) 
            ? this.callChain = this.callChain.then( () => this[ method ].call( this ) )
            : [ this.Validate, this.Context, this.Db, this.Response ]
              .forEach( obj => this.callChain = this.callChain.then( result => obj.apply( this, result ) ) )

        start();

        return this
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

    notFound( stopChain=false ) { return this.respond( { stopChain, code: 404 } ) },

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
        data.body = JSON.stringify( data.body || {} )
        this.response.writeHead( data.code || 200, Object.assign( this.getHeaders( data.body ), data.headers || {} ) )
        this.response.end( data.body )
        if( data.stopChain ) { this.handled = true; throw new Error("Handled") }
    }
} )
