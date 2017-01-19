module.exports = Object.assign( {}, require('./__proto__'), {

    Moment: require('moment'),
    
    d3: Object.assign( require('d3-shape'), require('d3-scale') ),

    dateChanged( el, e ) {
        console.log('ad');
        console.log(el);
        console.log(e);
    },

    postRender() {

        this.ticks = this.d3.scaleTime()
            .domain( [ this.opts.dates.from.toDate(), this.opts.dates.to.toDate() ] )
            .ticks()
    
        this.Xhr( { method: 'get', resource: 'eventCounts', qs: JSON.stringify( this.ticks ) } )

        return this
    },
} )
