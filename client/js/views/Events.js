module.exports = Object.assign( {}, require('./__proto__'), {

    Moment: require('moment'),

    clearGraph() {
        this.rendered = false;
        [ 'xAxis', 'yAxis', 'areas', 'lines', 'points' ].forEach( el => this.els[ el ].innerHTML = '' )
    },

    computeSizes() {
        this.boundingHeight = this.els.graph.clientHeight
        this.boundingWidth = this.els.graph.clientWidth
    },
    
    d3: Object.assign( require('d3-shape'), require('d3-scale'), require('d3-axis'), require('d3-selection'), require('d3-time-format') ),

    drawGraph() {
        
        this.handleData()
        .then( () => {
       
            this.setAxises() 

            this.setLines()

            this.setAreas()

            this.originalHeight = this.boundingHeight
            this.originalWidth = this.boundingWidth

            this.handlePotentialXScaling()

            return Promise.resolve( this.rendered = true )
        } )
        .catch( this.Error )
    },

    onDateChange( el, e ) {
        this.opts.dates[ el ] = this.Moment( e )

        if( this.opts.dates.to.isBefore( this.opts.dates.from ) ) return

        this.clearGraph()

        this.setTimeScale()

        this.drawGraph()
    },

    onWidgetSelect( name ) {

        this.dataType = name
        
        this.clearGraph()
        
        this.drawGraph()
    },

    generateQs() {
        const firstTick = this.Moment( this.timeTicks[0] )
        firstTick.subtract( this.Moment( this.timeTicks[1] ).diff( firstTick ), 'ms' )

        return JSON.stringify( { dates: [ firstTick.toDate() ].concat( this.timeTicks ), data: this.dataType, role: this.user.data.role } )
    },

    handleData() {
        return this.Xhr( { method: 'get', resource: `timeSeries`, qs: this.generateQs() } )
        .then( data => {
            this.dataByNetwork = { }

            this.valueRange = [ Infinity, 0 ]

            return Promise.resolve(
                data.forEach( aggregate => {
                    const count = parseInt( aggregate.count )
                    if( count < this.valueRange[0] ) this.valueRange[ 0 ] = count
                    if( count > this.valueRange[1] ) this.valueRange[ 1 ] = count

                    if( !this.dataByNetwork[ aggregate.name ] ) this.dataByNetwork[ aggregate.name ] = { data: [ ], label: aggregate.label }
                    this.dataByNetwork[ aggregate.name ].data.push( [ this.timeScale( this.timeTicks[ aggregate.index ] ), count ] )
                } )
            )
        } )
    },

    handlePotentialXScaling() {
        const graphWidth = this.els.scale.getBBox().width

        if( ( graphWidth + 55 ) > this.originalWidth ) {
            this.originalWidth = graphWidth + 55
            this.scaleGraph()
        } else {
            this.scaleGraph( { reset: true } )
        }
    },

    postRender() {
        this.computeSizes()

        this.setTimeScale()
        
        return this
    },

    setAreas() {
        const area = this.d3.area()
            .x( d => d[0] )
            .y1( d => d[1] )
            .y0( ( d, i ) => {
                const tickValues = this.valuesByTick[i],
                      index = tickValues.indexOf( d[1] )

                return index === tickValues.length - 1 ? this.valueScale( this.valueRange[1] ) : tickValues[ index + 1 ]
            } )

        this.d3.select(this.els.areas)
            .attr( 'transform', `translate( ${41 + this.xTranslation}, ${this.yTranslation} )` )

        Object.keys( this.dataByNetwork ).forEach( network => {
            this.d3.select(this.els.areas)
            .append('path')
                .attr( 'class', `${network}` )
                .attr( 'd', area( this.dataByNetwork[ network ].data ) )
        } )
    },

    setAxises() {
        this.valueScale =
            this.d3.scaleLinear()
                .domain( this.valueRange.reverse() )
                .range( [ 0, this.boundingHeight - 40 ] )

        const dayDiff = this.Moment( this.timeTicks[1] ).diff( this.Moment( this.timeTicks[0] ), 'd' )

        this.xAxis =
            this.d3.axisBottom( this.timeScale )
                .tickFormat( dayDiff > 0 ? this.d3.timeFormat( '%Y-%m-%d' ) : this.d3.timeFormat( '%m-%d-%H:%M' ) )
                .tickValues( this.timeTicks )

        this.yAxis =
            this.d3.axisLeft( this.valueScale )
                .tickValues( this.valueScale.ticks(6) )
                .tickSizeOuter(0)
                .tickSizeInner( this.boundingWidth - 60 )

        this.d3.select( this.els.xAxis )
        .attr( 'class', `x-axis` )
        .attr( 'transform', `translate( 40, ${this.boundingHeight - 20} )` )
        .call( this.xAxis )

        this.d3.select( this.els.yAxis )
        .attr( 'class', `y-axis` )
        .call( this.yAxis )

        this.d3.selectAll( '.y-axis line' )
        .attr( 'transform', `rotate( 180, 0, 0 )` )
            
        this.d3.selectAll( '.y-axis text' )
        .attr( 'transform', `translate( ${this.boundingWidth - 60}, 0 )` )
       
        this.xTranslation = this.timeScale( this.timeTicks[1] ) / 2

        const xAxisPath = this.d3.select('.x-axis .domain')
        xAxisPath.attr( 'd', `${xAxisPath.attr( 'd' ).slice( 0, -2 )}M${this.timeScale( this.timeTicks[ this.timeTicks.length - 1 ] )},0.5h${this.xTranslation*2}V6` )

        this.d3.selectAll( '.x-axis text' )
        .attr( 'x', this.xTranslation )
        .attr( 'y', 6 )

        this.yTranslation = this.boundingHeight - this.els.yAxis.getBBox().height - 20
           
        this.d3.select( this.els.yAxis )
        .attr( 'transform', `translate( 40, ${this.yTranslation} )` )
    },

    setPoint( network, x, y ) {
        this.d3.select(this.els.points)
            .append('circle')
                .attr('class', network )
                .attr('cx', x )
                .attr('cy', y )
                .attr('r', 2 )
    },

    setLine( network, { x1, y1, x2, y2 } ) {
        this.d3.select(this.els.lines)
            .append('line')
                .attr( 'class', network )
                .attr( 'x1', x1 )
                .attr( 'y1', y1 )
                .attr( 'x2', x2 )
                .attr( 'y2', y2 )
    },

    setLines() {

        this.valuesByTick = { }
        
        this.d3.select(this.els.points)
            .attr( 'transform', `translate( ${41 + this.xTranslation}, ${this.yTranslation} )` )
        
        this.d3.select(this.els.lines)
            .attr( 'transform', `translate( ${41 + this.xTranslation}, ${this.yTranslation} )` )

        Object.keys( this.dataByNetwork ).forEach( network => {
            
            this.dataByNetwork[ network ].data = this.dataByNetwork[ network ].data.map( ( [ x, count ], i ) => {
                const y = this.valueScale(count)

                if( ! this.valuesByTick[ i ] ) { this.valuesByTick[ i ] = [ ] }
                this.valuesByTick[ i ].push( y )

                this.setPoint( network, x, y )

                return [ x, y ]
            } )
             
            this.dataByNetwork[ network ].data.forEach( ( [ x, y ], i ) => {
                if( i !== 0 ) {
                    const prev = this.dataByNetwork[ network ].data[ i - 1 ]
                    this.setLine( network, { x1: prev[0], y1: prev[1], x2: x, y2: y } )
                }
            } )
        } )

        Object.keys( this.valuesByTick ).forEach( i => this.valuesByTick[i].sort( ( a, b ) => a - b ) )
    },

    handleHourlyTimeScale() {
        this.timeScale = this.d3.linearScale()
            .domain( [ 0, this.opts.dates.to.diff( this.opts.dates.from, 'hours' ) ] )
            .range( [ 0, this.boundingWidth - 100 ] )

        this.timeTicks = this.d3.timeHour.every(6)
    },

    setTimeScale() {
        //const dayDiff = this.opts.dates.to.diff( this.opts.dates.from, 'd' )

        //if( dayDiff < 3 ) return this.handleHourlyTimeScale()

        this.timeScale = this.d3.scaleTime()
            .domain( [ this.opts.dates.from.toDate(), this.opts.dates.to.toDate() ] )
            .range( [ 0, this.boundingWidth - 100 ] )
      
        this.timeTicks = this.timeScale.ticks(7)
    },

    scaleGraph( opts={} ) {
        this.computeSizes()

        let ratio = [ this.boundingWidth / this.originalWidth, this.boundingHeight / this.originalHeight ]
        
        if( opts.reset ) ratio = [ 1, 1 ]

        this.d3.select( this.els.scale ).attr( `transform`, `scale( ${ratio[0]}, ${ratio[1]} )` )
    },

    size() {
        if( this.rendered ) this.scaleGraph()
            
        return true
    }
} )
