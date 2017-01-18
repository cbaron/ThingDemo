module.exports = Object.assign( { }, require('../__proto__'), {

    apply( method ) {
        return this.Postgres.query(`SELECT n.name, n.label, count.count FROM network n JOIN ( SELECT COUNT(id), "networkId" FROM sensor GROUP BY "networkId" ) count ON count."networkId" = n.id`)
        .then( results => this.respond( { body: results.rows } ) )
    }

} )
