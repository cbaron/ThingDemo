module.exports = Object.assign( { }, require('./__proto__'), {

    parse( response ) {
        return response.map( row =>
            ( {
                data: JSON.parse( row.data ),
                location: JSON.parse( row.location ).coordinates
            } )
        )
    },

    resource: 'geo'

} )
