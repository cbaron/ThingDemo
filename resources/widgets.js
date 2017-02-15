module.exports = Object.assign( { }, require('./__proto__'), {

    apply( method ) {
        const dates = JSON.parse( decodeURIComponent( this.qs ) ).dates

        return Promise.all( [
            this.Postgres.query( `SELECT COUNT( id ) FROM event WHERE created BETWEEN '${dates.from}' AND '${dates.to}'` ),
            this.Postgres.query( `SELECT COUNT( id ) FROM deployment WHERE created BETWEEN '${dates.from}' AND '${dates.to}'` ),
            this.Postgres.query( `SELECT COUNT( id ) FROM sensor WHERE created BETWEEN '${dates.from}' AND '${dates.to}'` ),
            this.Postgres.query( `SELECT COUNT( id ) FROM sensor WHERE created BETWEEN '${dates.from}' AND '${dates.to}' AND "isActive" = true` ),
            this.Postgres.query( `SELECT COUNT( id ) FROM app WHERE created BETWEEN '${dates.from}' AND '${dates.to}'` )
        ] )
        .then( ( [ events, deployments, sensors, activeSensors, apps ] ) => {
            return this.respond( {
                body: {
                    events: events.rows[0].count,
                    deployments: deployments.rows[0].count,
                    sensors: sensors.rows[0].count,
                    activeSensors: activeSensors.rows[0].count,
                    apps: apps.rows[0].count,
                    revenue: parseFloat( events.rows[0].count ) * 1.1
                }
            } )
        } )
    } 
} )
