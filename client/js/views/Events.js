module.exports = Object.assign( {}, require('./__proto__'), {

    Moment: require('moment'),
    
    d3: Object.assign( require('d3-shape'), require('d3-scale'), require('d3-axis'), require('d3-selection'), require('d3-time-format') ),

    dateChanged( el, e ) {
        console.log('ad');
        console.log(el);
        console.log(e);
    },

    postRender() {
        this.graphHeight = this.els.graph.clientHeight
        this.graphWidth = this.els.graph.clientWidth

        this.bottomTicks = this.d3.scaleTime()
            .domain( [ this.opts.dates.from.toDate(), this.opts.dates.to.toDate() ] )
            .ticks()

        this.bottomAxis = this.d3.scaleTime()
            .domain( [ this.opts.dates.from.toDate(), this.opts.dates.to.toDate() ] )
            .range( [ 0, this.graphWidth - 60 ] )
        
        this.byNetwork = { }
         
        this.Xhr( { method: 'get', resource: 'eventCounts', qs: JSON.stringify( this.bottomTicks ) } )
        .then( data => {
            const range = [ 0, Infinity ]
            data.forEach( aggregate => {
                const count = parseInt( aggregate.count )
                if( count > range[0] ) range[ 0 ] = count
                if( count < range[1] ) range[ 1 ] = count

                if( !this.byNetwork[ aggregate.name ] ) this.byNetwork[ aggregate.name ] = { data: [ ], label: aggregate.label }
                this.byNetwork[ aggregate.name ].data.push( [ this.bottomAxis( this.bottomTicks[ aggregate.index + 1 ] ), count ] )
            } )

            this.leftAxis = this.d3.scaleLinear()
                .domain( range )
                .range( [ 0, this.graphHeight - 40 ] )

            const axis = {
                x: this.d3.axisBottom( this.bottomAxis ).tickFormat( this.d3.timeFormat( '%Y-%m-%d' ) ),
                y: this.d3.axisLeft( this.leftAxis )
            }

            
            this.d3.select( this.els.xAxis )
            .attr( 'class', `x-axis` )
            .attr( 'transform', `translate( 40, ${this.graphHeight - 20} )` )
            .call( axis.x )

            this.d3.select( this.els.yAxis )
            .call( axis.y )
           
            this.d3.select( this.els.yAxis )
            .attr( 'transform', `translate( 40, ${this.graphHeight - this.els.yAxis.getBBox().height - 20} )`)

            Object.keys( this.byNetwork ).forEach( network => {
                const path = this.d3.line()( this.byNetwork[ network ].data.map( ( [ x, count ] ) => ( [ x, this.leftAxis(count) ] ) ) )
                this.d3.select(this.els.graph)
                .append('path')
                    .attr( 'class', network )
                    .attr( 'd', path )
            } )

        } )

        return this
    },
} )
