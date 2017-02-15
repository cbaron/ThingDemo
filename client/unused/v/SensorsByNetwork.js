module.exports = Object.assign( {}, require('./__proto__'), {

    computeSizes() {
        this.height = this.els.chart.clientHeight 
        this.width = this.els.chart.clientWidth 
        this.radius = ( this.height - this.width > 0 ? this.width * .75 : this.height * .75 ) / 2
    },

    computeTranslation() {
        return [
            this.radius + ( ( this.width - ( this.radius * 2 ) ) / 2 ),
            this.radius + ( ( this.height - ( this.radius * 2 ) ) / 2 )
        ]
    },

    d3: Object.assign( require('d3-shape'), require('d3-selection') ),

    draw() {
        const arc =
            this.d3.arc()
            .innerRadius( 0 )
            .outerRadius( this.radius )
              
        this.group = this.d3.select( this.els.group )

        const translation = this.computeTranslation()

        this.group.attr( 'transform', `translate( ${translation[0]}, ${translation[1]} )` )

        this.d3.pie()( this.model.data.map( data => data.count ) )
            .map( ( pieSlice, i ) => {
                const args = { startAngle: pieSlice.startAngle, endAngle: pieSlice.endAngle },
                      centroid = arc.centroid( args )

                this.group.append( 'path' )
                    .attr( 'd', arc( args ) )
                    .attr( 'class', this.model.data[i].name )
                
                this.group.append( 'text' )
                    .attr( 'text-anchor', 'middle' )
                    .attr( 'x', centroid[0] )
                    .attr( 'y', centroid[1] )
                    .text( this.model.data[i].label )
            } )

        this.originalRadius = this.radius

        return Promise.resolve( this.rendered = true )
    },

    getData() {
        if( !this.model ) this.model = Object.create( this.Model, { resource: { value: 'sensorsByNetwork' } } )

        return this.model.get()
    },

    postRender() {
        this.computeSizes()

        this.getData()
        .then( () => this.draw() )
        .catch( this.Error )

        return this
    },

    redraw() {
        
    },

    size() {
        if( this.rendered ) {
            this.computeSizes()

            const ratio = this.radius / this.originalRadius
            const translation = this.computeTranslation()

            this.group.attr( `transform`, `translate( ${translation[0]}, ${translation[1]} ) scale( ${ratio}, ${ratio} )` )
        }
        return true
    }
} )
