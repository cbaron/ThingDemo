module.exports = Object.assign( { }, require('./__proto__'), {

    apply( method ) {
        const dates = JSON.parse( decodeURIComponent( this.qs ) ).dates

        return Promise.all( [
            this.Postgres.query( `SELECT COUNT( id ) FROM event WHERE created BETWEEN '${dates.from}' AND '${dates.to}'` ),
            this.Postgres.query( `SELECT COUNT( id ) FROM deployment WHERE created BETWEEN '${dates.from}' AND '${dates.to}'` ),
            this.Postgres.query( `SELECT "sensorId", MIN( created ) as created FROM event WHERE created < '${dates.to}' GROUP BY "sensorId"` ),
            this.Postgres.query( `SELECT e.data FROM event e JOIN ( SELECT "sensorId", MAX( created ) as created FROM event GROUP BY "sensorId" ) e2 ON e."sensorId" = e2."sensorId" AND e.created = e2.created` )
        ] )
        .then( ( [ total, deployments,  bySensor, current ] ) => {
            const totalEvents = total.rows[0].count,
                  totalDeployments = deployments.rows[0].count,
                  totalSensors = bySensor.rows.length,
                  currentData = this.parseData( current.rows )

            return this.respond( {
                body: {
                    totalEvents,
                    sensorNodes: totalSensors,
                    sensorsActive: totalSensors,
                    openSpaces: currentData.open, 
                    occupiedSpaces: currentData.occupied,
                    revenue: parseFloat( totalEvents ) * 1.1
                }
            } )
        } )
    }, 

    parseData( rows ) {
        return rows.reduce( ( memo, row ) => {
            JSON.parse( row.data ).isAvailable
                ? memo.open++
                : memo.occupied++
            return memo },
            { open: 0, occupied: 0 }
        )
    }
} )
