module.exports = Object.assign( {}, require('./__proto__'), {

    d3: Object.assign( require('d3-shape') ),

    postRender() {
        this.height = this.els.chart.clientHeight 
        this.width = this.els.chart.clientWidth 
        this.diameter = this.height - this.width > 0 ? this.width * .75 : this.height * .75
        const radius = this.diameter / 2

        this.arc =
            this.d3.arc()
            .innerRadius( 0 )
            .outerRadius( radius )

        this.arcs = [ ]

        this.model = Object.create( this.Model, { resource: { value: 'sensorsByNetwork' } } )

        this.model.get()
        .then( () => {

            const els = this.d3.pie()( this.model.data.map( data => data.count ) ).map( ( pieSlice, i ) => {
                const args = { startAngle: pieSlice.startAngle, endAngle: pieSlice.endAngle },
                      path = this.arc( args ),
                      centroid = this.arc.centroid( args )

                return `<path class="${this.model.data[i].name}" d="${path}"></path>` +
                       `<text text-anchor="middle" x="${centroid[0]}" y="${centroid[1]}">${this.model.data[i].label}</text>` 
            } ).join('')

            this.slurpTemplate( { template: `<svg version="1.1"><g transform="translate(${radius},${radius})">${els}</g></svg>`, insertion: { el: this.els.chart } } )

            this.size()    
        } )
        .catch( this.Error )

        return this
    },

    size() {
        if( this.diameter ) {
            //this.els.chart.firstChild.style.height = `${this.diameter}px`
        }
    }
} )
