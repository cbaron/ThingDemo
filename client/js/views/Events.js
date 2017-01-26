module.exports = Object.assign( {}, require('./__proto__'), {

    computeSizes() {
        this.graphHeight = this.els.graph.clientHeight
        this.graphWidth = this.els.graph.clientWidth
    },

    Moment: require('moment'),
    
    d3: Object.assign( require('d3-shape'), require('d3-scale'), require('d3-axis'), require('d3-selection'), require('d3-time-format') ),

    dateChanged( el, e ) {
        console.log('ad');
        console.log(el);
        console.log(e);
    },

    generateQs() {
        const firstTick = this.Moment( this.timeTicks[0] )
        firstTick.subtract( this.Moment( this.timeTicks[1] ).diff( firstTick ), 'ms' )

        return JSON.stringify( [ firstTick.toDate() ].concat( this.timeTicks ) )
    },

    getLastTimeTick() {
        const lastTick = this.Moment( this.timeTicks[ this.timeTicks.length -1 ] )
        lastTick.add( lastTick.diff( this.Moment( this.timeTicks[ this.timeTicks.length - 2 ] ), 'ms' ) )

        return lastTick.toDate()
    },

    handleData() {
        return this.Xhr( { method: 'get', resource: 'eventCounts', qs: this.generateQs() } )
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

    postRender() {
        this.computeSizes()

        this.setTimeScale()
        
        this.handleData()
        .then( () => {
       
            this.setAxises() 

            this.setLines()

            this.setAreas()

            this.originalHeight = this.graphHeight
            this.originalWidth = this.graphWidth

            return Promise.resolve( this.rendered = true )
        } )
        .catch( this.Error )

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
                .range( [ 0, this.graphHeight - 40 ] )

        this.xAxis =
            this.d3.axisBottom( this.timeScale )
                .tickFormat( this.d3.timeFormat( '%Y-%m-%d' ) )
                .tickValues( this.timeTicks )

        this.yAxis =
            this.d3.axisLeft( this.valueScale )
                .tickValues( this.valueScale.ticks(8) )
                .tickSizeOuter(0)
                .tickSizeInner( this.graphWidth - 60 )

        this.d3.select( this.els.xAxis )
        .attr( 'class', `x-axis` )
        .attr( 'transform', `translate( 40, ${this.graphHeight - 20} )` )
        .call( this.xAxis )

        this.d3.select( this.els.yAxis )
        .attr( 'class', `y-axis` )
        .call( this.yAxis )

        this.d3.selectAll( '.y-axis line' )
        .attr( 'transform', `rotate( 180, 0, 0 )` )
            
        this.d3.selectAll( '.y-axis text' )
        .attr( 'transform', `translate( ${this.graphWidth - 60}, 0 )` )
       
        this.xTranslation = this.timeScale( this.timeTicks[1] ) / 2

        const xAxisPath = this.d3.select('.x-axis .domain')
        xAxisPath.attr( 'd', `${xAxisPath.attr( 'd' )}M${this.timeScale( this.timeTicks[ this.timeTicks.length - 1 ] )},0.5h${this.xTranslation*2}V6` )

        this.d3.selectAll( '.x-axis text' )
        .attr( 'x', this.xTranslation )
        .attr( 'y', 6 )

        this.yTranslation = this.graphHeight - this.els.yAxis.getBBox().height - 20
           
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

    setTimeScale() {
        this.timeScale = this.d3.scaleTime()
            .domain( [ this.opts.dates.from.toDate(), this.opts.dates.to.toDate() ] )
            .range( [ 0, this.graphWidth - 100 ] )

        this.timeTicks = this.timeScale.ticks(9)
    },

    size() {
        if( this.rendered ) {
            console.log('aascd')
            this.computeSizes()

            console.log('aascdqopqpqpqp')
            const ratio = [ this.graphWidth / this.originalWidth, this.graphHeight / this.originalHeight ]

            this.d3.select( this.els.scale ).attr( `transform`, `scale( ${ratio[0]}, ${ratio[1]} )` )
        }
        return true
    }
} )
