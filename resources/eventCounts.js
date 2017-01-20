module.exports = Object.assign( { }, require('./__proto__'), {

    apply( method ) {
        const dates = JSON.parse( decodeURIComponent( this.qs ) ),
              query = []

        dates.forEach( ( date, i ) => {
            if( i === ( dates.length - 1 ) ) return
            query.push(`SELECT n.name, n.label, COUNT(e.id) as "count", ${i} as "index" FROM event e JOIN sensor s ON s.id = e."sensorId" JOIN network n ON n.id = s."networkId" WHERE e.created BETWEEN '${date}' AND '${dates[i+1]}' GROUP BY n.name, n.label`)
        } )
        return this.Postgres.query( query.join(' UNION ') + ` ORDER BY name, index` )
        .then( results => this.respond( { body: results.rows } ) )
    }

} )
