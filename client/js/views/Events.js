module.exports = Object.assign( {}, require('./__proto__'), {

    d3: Object.assign( require('d3-shape') ),

    dateChanged( el, e ) {
        console.log('ad');
        console.log(el);
        console.log(e);
    },

    postRender() {
        this.arcGenerator =
            this.d3.arc()
            .innerRadius(0)
            .outerRadius(100)
        this.arcs = [ ]

        this.sensorsByNetwork = Object.create( this.Model, { resource: { value: 'sensorsByNetwork' } } )

        this.sensorsByNetwork.get()
        .then( () => {
            console.log( this.sensorsByNetwork.data.map( data => data.count ) )
            console.log(this.d3.pie()( this.sensorsByNetwork.data.map( data => data.count ) ) )

            this.d3.pie()( this.sensorsByNetwork.data.map( data => data.count ) ).forEach( pieSlice =>
                this.arcs.push( this.arcGenerator( { startAngle: pieSlice.startAngle, endAngle: pieSlice.endAngle } ) )
            )

            const els = this.arcs.map( arc => `<path d="${arc}"></path>` ).join('')
            this.slurpTemplate( { template: `<svg version="1.1" viewBox="0 0 300 300""><g transform="translate(150,150)">${els}</g></svg>`, insertion: { el: this.els.graph }, noClass: true } )

            
        } )

        return this
    },
} )
