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

        let first = this.Moment( this.bottomTicks[0] )
        first.subtract( this.Moment( this.bottomTicks[1] ).diff( first ), 'ms' )
        const qs = JSON.stringify( [ first.toDate() ].concat( this.bottomTicks ) )

        this.bottomAxis = this.d3.scaleTime()
            .domain( [ this.opts.dates.from.toDate(), this.opts.dates.to.toDate() ] )
            .range( [ 0, this.graphWidth - 60 ] )
        
        this.byNetwork = { }
         
        this.Xhr( { method: 'get', resource: 'eventCounts', qs } )
        .then( data => {
            const range = [ 0, Infinity ]
            const indexValues = { }
            data.forEach( aggregate => {
                const count = parseInt( aggregate.count )
                if( count > range[0] ) range[ 0 ] = count
                if( count < range[1] ) range[ 1 ] = count

                if( !this.byNetwork[ aggregate.name ] ) this.byNetwork[ aggregate.name ] = { data: [ ], label: aggregate.label }
                this.byNetwork[ aggregate.name ].data.push( [ this.bottomAxis( this.bottomTicks[ aggregate.index ] ), count ] )
            } )


            this.leftAxis = this.d3.scaleLinear()
                .domain( range )
                .range( [ 0, this.graphHeight - 40 ] )

            const axis = {

                x: this.d3.axisBottom( this.bottomAxis )
                    .tickFormat( this.d3.timeFormat( '%Y-%m-%d' ) )
                    .tickSizeOuter(0),

                y: this.d3.axisLeft( this.leftAxis )
                    .tickValues( this.leftAxis.ticks(8) )
                    .tickSizeOuter(0)
                    .tickSizeInner( this.graphWidth - 60 )
            }

            this.d3.select( this.els.xAxis )
            .attr( 'class', `x-axis` )
            .attr( 'transform', `translate( 40, ${this.graphHeight - 20} )` )
            .call( axis.x )

            this.d3.select( this.els.yAxis )
            .attr( 'class', `y-axis` )
            .call( axis.y )

            this.d3.selectAll( '.y-axis line' )
            .attr( 'transform', `rotate( 180, 0, 0 )` )
            
            this.d3.selectAll( '.y-axis text' )
            .attr( 'transform', `translate( ${this.graphWidth - 60}, 0 )` )
           
            this.d3.select( this.els.yAxis )
            .attr( 'transform', `translate( 40, ${this.graphHeight - this.els.yAxis.getBBox().height - 20} )`)

            Object.keys( this.byNetwork ).forEach( network => {
                this.byNetwork[ network ].data = this.byNetwork[ network ].data.map( ( [ x, count ], i ) => {
                    const y = this.leftAxis(count)
                    if( ! indexValues[ i ] ) { indexValues[ i ] = [ ] }
                    indexValues[ i ].push( y )
                    return [ x, y ]
                } )
                const line = this.d3.line()( this.byNetwork[ network ].data )

                this.d3.select(this.els.graph)
                .append('path')
                    .attr( 'class', network )
                    .attr( 'd', line )
                    .attr( 'transform', `translate( 41, ${this.graphHeight - this.els.yAxis.getBBox().height - 20} )` )
            } )

            Object.keys( indexValues ).forEach( i => indexValues[i].sort( ( a, b ) => a - b ) )

            const area = this.d3.area()
                .x( d => d[0] )
                .y1( d => d[1] )
                .y0( ( d, i ) => {
                    var index = indexValues[i].indexOf( d[1] )
                    return index === indexValues[i].length - 1 ? this.leftAxis( range[1] ) : indexValues[ i ][ index + 1 ]
                } )

            Object.keys( this.byNetwork ).forEach( network => {
                this.d3.select(this.els.graph)
                .append('path')
                    .attr( 'class', `${network} area` )
                    .attr( 'd', area( this.byNetwork[ network ].data ) )
                    .attr( 'transform', `translate( 41, ${this.graphHeight - this.els.yAxis.getBBox().height - 20} )` )
            } )

        } )

        return this
    },
} )
