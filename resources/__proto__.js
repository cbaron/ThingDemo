module.exports = Object.assign( { }, require('../lib/MyObject'), {
    
    JWS: require('jws'),

    Context: require('lib/.Context'),
    
    Db: require('lib/.Db'),
    
    Postgres: require('../dal/Postgres'),

    Response: require('lib/Response'),

    Validate: require('lib/.Validate'),
    
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

    makeToken( obj ) {
        return new Promise( ( resolve, reject ) =>
            this.JWS.createSign( {
                header: { "alg": "HS256", "typ": "JWT" },
                payload: JSON.stringify( obj ),
                privateKey: process.env.JWS_SECRET
            } )
            .on( 'done', resolve )
            .on( 'error', reject )
        )
    },

    notFound( stopChain=false ) { return this.respond( { stopChain, code: 404 } ) },

    respond( data ) {
        data.body = JSON.stringify( data.body || {} )
        this.response.writeHead( data.code || 200, Object.assign( this.getHeaders( data.body ), data.headers || {} ) )
        this.response.end( data.body )
        if( data.stopChain ) { this.handled = true; throw new Error("Handled") }
    }
} )
