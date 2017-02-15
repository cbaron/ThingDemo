module.exports = Object.assign( { }, require('./__proto__'), {

    Bcrypt: require('bcrypt'),

    addUserRoles( person, roles ) {
        const partner = person.email.slice( person.email.lastIndexOf('@') + 1 ).replace( /\.\w+/, '' )
        return Promise.all(
            roles.map( role =>
                this.Postgres.query( `SELECT id, '${role.name}' as "role", name, label FROM ${role.name} WHERE name = '${partner}'` )
            )
        )
        .then( results =>
            Promise.resolve(
                Object.assign( person, { roles: results.filter( result => result.rows.length ).map( result => result.rows[0] ) } )
            )
        )
    },

    apply( method ) {
        return this.slurpBody()
        .then( () => this.Postgres.query( `SELECT * FROM person WHERE email = $1`, [ this.body.email ] ) )
        .then( result => {
            if( result.rows.length !== 1 ) return this.authError('Invalid Credentials')
            
            const row = result.rows[0]
            const password = row.password
            delete row.password

            return this.P( this.Bcrypt.compare, [ this.body.password, password ] )
            .then( ( [ checkedOut ] ) => {
                if( !checkedOut ) return this.authError('Invalid Credentials')

                return this.Postgres.query( `SELECT name FROM role WHERE id IN ( SELECT "roleId" FROM membership WHERE "personId" = ${row.id} )` )
                .then( result => this.addUserRoles( row, result.rows ) )
                .then( user => this.Jwt.makeToken( user ) )
            } )
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

    authError( error ) { return this.respond( { stopChain: true, body: error, code: 500 } ) },

} )
