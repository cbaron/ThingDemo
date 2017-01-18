module.exports = Object.assign( { }, require('../../../lib/MyObject'), require('events').EventEmitter.prototype, {

    Xhr: require('../Xhr'),

    get( opts={ query:{} } ) {
        if( opts.query || this.pagination ) Object.assign( opts.query, this.pagination )
        return this.Xhr( { method: opts.method || 'get', resource: this.resource, headers: this.headers || {}, qs: opts.query ? JSON.stringify( opts.query ) : undefined } )
        .then( response => {
            if( !this.pagination ) return Promise.resolve( this.data = response )

            if( !this.data ) this.data = [ ]
            this.data = this.data.concat(response)
            this.pagination.skip += this.pagination.limit
            return Promise.resolve(response)
        } )
    }

} )
