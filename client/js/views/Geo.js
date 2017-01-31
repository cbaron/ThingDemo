module.exports = Object.assign( {}, require('./__proto__'), {

    Io: require('socket.io-client'),

    carPath: require('./lib/carPath'),

    initMap() {

        this.map = new google.maps.Map( this.els.container, {
          center: { lat: 39.9505611, lng: -75.1937014 },
          disableDefaultUI: true,
          zoom: 19
        } )

        this.model.get()
        .then( data => {

            data.forEach( datum =>
                new google.maps.Marker( {
                    position: { lat: datum.location[1], lng: datum.location[0] },
                    map: this.map,
                    draggable: false,
                    icon: this.getIcon( datum.data )
                } )
            )
       
            this.Io().on( 'eventCreated', data => {
                console.log( data );
            } )
        } )
        .catch( this.Error )
    },

    getIcon( data ) {
        return {
            path: this.carPath,
            fillColor: data.isAvailable ? 'gray' : 'green',
            fillOpacity: .6,
            anchor: new google.maps.Point(0,0),
            strokeWeight: 0,
            scale: .075
        }
    },

    model: Object.create( require( '../models/Geo' ) ),

    postRender() {

        this.setHeight( this.height )

        window.google
            ? this.initMap()
            : window.initMap = this.initMap

        return this
    },

    setHeight( height ) {
        this.els.container.style.height = `${height}px`;
    },

    toggleRandomSpot() {
        let datum = this.data[ Math.floor( Math.random() * this.data.length ) ]

        datum.isOpen = !datum.isOpen
        datum.icon.fillColor = datum.isOpen ? 'gray' : 'green'
        datum.marker.set( 'icon', datum.icon )
    }

} )
