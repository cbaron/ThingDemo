module.exports = Object.assign( {}, require('./__proto__'), {

    d3: Object.assign( require('d3-shape') ),

    dateChanged( el, e ) {
        console.log('ad');
        console.log(el);
        console.log(e);
    },

    postRender() {
        this.sensorsByNetwork = Object.create( this.Model, { resource: { value: 'sensorsByNetwork' } } )

        this.sensorsByNetwork.get()
        .then( () => {
           this.arcs = db.arc()( d3.pie()( this.sensorsByNetwork.data.map( data.count ) ) )
           console.log( this.arcs );
        } )

        return this
    },
} )
