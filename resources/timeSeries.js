module.exports = Object.assign( { }, require('./__proto__'), {

    apply( method ) {
        const query = []
       
        this.query = JSON.parse( decodeURIComponent( this.qs ) )

        this.query.dates.forEach( ( date, i ) => {
            if( i === ( this.query.dates.length - 1 ) ) return

            query.push( this[ this.query.data ]( date, i ) )
        } )

        return this.Postgres.query( query.join(' UNION ') + ` ORDER BY name, index` )
        .then( results => this.respond( { body: results.rows } ) )
    },

    events( date, i ) {
        const moreJoin = ( this.query.role && this.query.role.role === 'network' ) ? `AND n.id = ${this.query.role.id} ` : ``
        return `` +
            `SELECT n.name, n.label, COALESCE( COUNT(e.id), 0 ) as "count", ${i} as "index" ` +
            `FROM event e ` +
            `JOIN sensor s ON s.id = e."sensorId" ` +
            `JOIN deployment d ON d.id = s."deploymentId" ` +
            `JOIN network n ON n.id = d."networkId" ${moreJoin} ` +
            `WHERE e.created BETWEEN '${date}' AND '${this.query.dates[i+1]}' ` +
            `GROUP BY n.name, n.label`
    },

    nodes( date, i ) {
        const moreJoin = ( this.query.role && this.query.role.role === 'network' ) ? `AND n.id = ${this.query.role.id} ` : ``
        return `` +
            `SELECT n.name, n.label, COUNT(s.id) as "count", ${i} as "index" ` +
            `FROM sensor s ` +
            `JOIN deployment d ON s."deploymentId" = d.id ` +
            `JOIN network n ON n.id = d."networkId" ${moreJoin} ` +
            `WHERE s.created BETWEEN '${date}' AND '${this.query.dates[i+1]}' ` +
            `GROUP BY n.name, n.label`
    },

    deployments( date, i ) {
        const moreJoin = ( this.query.role && this.query.role.role === 'network' ) ? `AND n.id = ${this.query.role.id} ` : ``
        return `` +
            `SELECT n.name, n.label, COUNT(d.id) as "count", ${i} as "index" ` +
            `FROM deployment d ` +
            `JOIN network n ON n.id = d."networkId" ${moreJoin} ` +
            `WHERE d.created BETWEEN '${date}' AND '${this.query.dates[i+1]}' ` +
            `GROUP BY n.name, n.label`
    },

    activeNodes( date, i ) {
        const moreJoin = ( this.query.role && this.query.role.role === 'network' ) ? `AND n.id = ${this.query.role.id} ` : ``
        return `` +
            `SELECT n.name, n.label, COUNT(s.id) as "count", ${i} as "index" ` +
            `FROM sensor s ` +
            `JOIN deployment d ON s."deploymentId" = d.id ` +
            `JOIN network n ON n.id = d."networkId" ${moreJoin} ` +
            `WHERE s.created BETWEEN '${date}' AND '${this.query.dates[i+1]}' AND s."isActive" = true ` +
            `GROUP BY n.name, n.label`
    },

    apps( date, i ) {
        const moreJoin = ( this.query.role && this.query.role.role === 'network' ) ? `AND n.id = ${this.query.role.id} ` : ``;
        return `` +
            `SELECT n.name, n.label, COUNT(a.id) as "count", ${i} as "index" ` +
            `FROM app a ` +
            `JOIN deployment d ON a."deploymentId" = d.id ` +
            `JOIN network n ON n.id = d."networkId" ${moreJoin} ` +
            `WHERE a.created BETWEEN '${date}' AND '${this.query.dates[i+1]}' ` +
            `GROUP BY n.name, n.label`
    },

} )
