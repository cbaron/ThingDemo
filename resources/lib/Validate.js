module.exports = Object.create( {

    DELETE( resource ) {
        if( resource.path.length !== 2  ) this.throwInvalid()

        return this.parseSignature( resource, this.parseCookies( resource.request.headers.cookie ) )
        .then( () =>
            ( Object.keys( resource.user ).length === 0 )
                ? Promise.reject("401")
                : Promise.resolve()
        )
    },

    GET( resource ) {
        return this.parseSignature( resource, this.parseCookies( resource.request.headers.cookie ) )
        .then( () =>
            ( Object.keys( resource.user ).length === 0 && resource.path[0] === 'admin' )
                ? Promise.reject("401")
                : Promise.resolve()
        )
    },

    OPTIONS( resource ) {
        return this.parseSignature( resource, this.parseCookies( resource.request.headers.cookie ) )
        .then( () =>
            ( Object.keys( resource.user ).length === 0 )
                ? Promise.reject("401")
                : Promise.resolve()
        )
    },

    PATCH( resource ) {

        if( resource.path.length !== 2 || Number.isNaN( parseInt( resource.path[1], 10 ) ) ) this.throwInvalid()

        return this.slurpBody( resource )
        .then( () => this.parseSignature( resource, this.parseCookies( resource.request.headers.cookie ) ) )
        .then( () =>
            ( Object.keys( resource.user ).length === 0 )
                ? Promise.reject("401")
                : Promise.resolve()
        )
    },

    POST( resource ) {
        if( resource.path.length !== 1 ) this.throwInvalid()
        
        return this.slurpBody( resource )
        .then( () => this.parseSignature( resource, this.parseCookies( resource.request.headers.cookie ) ) )
        .then( () =>
            ( Object.keys( resource.user ).length === 0 && resource.path[0] !== 'auth' )
                ? Promise.reject("401")
                : Promise.resolve()
        )
    },
    
    apply( resource ) { return this[ resource.request.method ]( resource ) },

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

    parseSignature( resource, signature ) {
        return new Promise( resolve => {
            var done = () => { resource.user = { }; return resolve() }
            if( ! signature ) return done()
            require('jws').createVerify( {
                algorithm: "HS256",
                key: process.env.JWS_SECRET,
                signature,
            } ).on( 'done', ( verified, obj ) => {
                if( ! verified ) return done()
                resource.user = obj.payload
                resolve()
            } ).on( 'error', e => { resource.Error( e.stack || e ); done() } )
        } )
    },

    slurpBody( resource ) {
        return new Promise( ( resolve, reject ) => {
            var body = ''
            
            resource.request.on( "data", data => {
                body += data

                if( body.length > 1e10 ) {
                    response.request.connection.destroy()
                    reject( new Error("Too many bits") )
                }
            } )

            resource.request.on( "end", () => {
                try { resolve(resource.body = JSON.parse( body )) }
                catch( e ) { reject( 'Unable to parse request : ' + e ) }
            } )
        } )
    },

    throwInvalid() { throw new Error("Invalid request") }
}, { } )
