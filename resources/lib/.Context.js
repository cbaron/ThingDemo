module.exports = Object.create( {

    apply( resource ) { return Promise.resolve( this[ resource.request.method ]( resource ) ) },

    DELETE(){},

    GET( resource ) {
        resource.query = require('querystring').parse( require('url').parse( resource.request.url ).query )
    },

    OPTIONS() {},

    PATCH( resource ) { [ 'id' ].forEach( key => { if( resource.body[ key ] ) delete resource.body[key] } ) },

    POST(){}   
}, { } )
