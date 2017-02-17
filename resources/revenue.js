module.exports = Object.assign( { }, require('./__proto__'), {

    apply( method ) {
        this.query = JSON.parse( decodeURIComponent( this.qs ) )
       
        const moreJoin = ( this.query.role && this.query.role.role === 'network' ) ? `AND n.id = ${this.query.role.id}` : ``,
              between = `BETWEEN '${ this.query.from }' AND '${ this.query.to }'`,
              subQuery = `` +
                `SELECT s."deploymentId", e."sensorId", count( e.id ) ` +
                `FROM event e ` +
                `JOIN sensor s ON e."sensorId" = s.id ` +
                `WHERE e.created ${between} ` +
                `GROUP BY s."deploymentId", e."sensorId"` 

        return this.Postgres.query(
            `SELECT d."subCategoryId", a.id, SUM( ev.count ) ` +
            `FROM deployment d ` +
            `JOIN network n ON n.id = d."networkId" ${moreJoin} ` +
            `JOIN app a ON a."deploymentId" = d.id AND a.created ${between} ` + 
            `JOIN ( ${ subQuery } ) ev ON ev."deploymentId" = d.id ` +
            `GROUP BY d."subCategoryId", a.id `
        )
        .then( results => this.respond( { body: results.rows } ) )
    }
} )
