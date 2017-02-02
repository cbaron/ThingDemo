module.exports = Object.assign( { }, require('./__proto__'), {

    apply( method ) {
        return this.Jwt.parseToken( this.parseCookies( this.request.headers.cookie ) )
        .then( user => this.respond( { body: user } ) )
    }

} )
