module.exports = Object.assign( { }, require('./__proto__'), {

    apply( method ) {
        const dates = JSON.parse( decodeURIComponent( this.qs ) )
        const query = []
        dates.forEach( ( date, i ) => {
            if( i === date.length - 1 ) return
            query.push(`SELECT "networkId", COUNT(id) as "${i}" FROM event WHERE created BETWEEN '${date}' AND '${dates[i+1]}' GROUP BY "networkId"`)
        } )
        console.log( query );
        return this.Postgres.query( query.join(' UNION ') )
        .then( results => this.respond( { body: results.rows } ) )
    }

} )
