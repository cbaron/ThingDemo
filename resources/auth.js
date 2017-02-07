module.exports = Object.assign( { }, require('./__proto__'), {

    Bcrypt: require('bcrypt'),

    apply( method ) {
        return this.slurpBody()
        .then( () => this.Postgres.query( `SELECT * FROM person WHERE email = $1`, [ this.body.email ] ) )
        .then( result => {
            if( result.rows.length !== 1 ) return this.authError('Invalid Credentials')
            
            const row = result.rows[0]
            const password = row.password
            delete row.password

            return this.P( this.Bcrypt.compare, [ this.body.password, password ] )
            .then( ( [ checkedOut ] ) =>
                    checkedOut
                        ? this.Jwt.makeToken( row )
                        : this.authError('Invalid Credentials')
            )
            .then( token =>
                this.respond( {
                    body: {},
                    headers: {
                        'Set-Cookie': `${process.env.COOKIE}=${token}; Expires=${new Date("2021-01-20").toUTCString()}`
                    }
                } )
            )
        } )
    },

    authError( error ) { return this.respond( { stopChain: true, body: error, code: 500 } ) }

} )
