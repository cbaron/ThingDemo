module.exports = Object.create( {

    apply( resource, result ) { return this[ resource.request.method ]( resource, result ) },

    DELETE( resource, result ) { return resource.respond( result.rows.id ) },

    GET( resource, result ) {
        return resource.respond( { body: body = ( resource.path.length > 2 ) ? ( ( result.rows.length ) ? result.rows[0] : { } ) : result.rows } )
    },

    PATCH( resource, result ) { resource.respond( { body: result.rows[0] } ) },

    POST( resource, result ) { resource.respond( { body: result.rows[0] } ) }
}, { } )
