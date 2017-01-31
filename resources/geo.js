module.exports = Object.assign( { }, require('./__proto__'), {

    apply( method ) {

        return this.Postgres.query(
            `SELECT s.id, ST_AsGeoJSON(s.location) as location, e.data ` +
            `FROM sensor s ` +
            `JOIN ( SELECT e."sensorId", e.data FROM event e JOIN ( SELECT "sensorId", MAX( created ) as created FROM event GROUP BY "sensorId" ) e2 ON e."sensorId" = e2."sensorId" AND e.created = e2.created ) e ` +
            `ON e."sensorId" = s.id ` +
            `WHERE s."networkId" = ( SELECT id FROM network WHERE name = 'machineq' )`
        )
        .then( result => this.respond( { body: result.rows } ) )
    }
} )
