module.exports = Object.assign( {}, require('./__proto__'), {

    carPath: require('./lib/carPath'),

    data: [
        { lat: 39.950614, lng: -75.193481, isOpen: true },
        { lat: 39.950620, lng: -75.193398, isOpen: true },
        { lat: 39.950595, lng: -75.193318, isOpen: true },
        { lat: 39.950585, lng: -75.193241, isOpen: true },
        { lat: 39.950573, lng: -75.193136, isOpen: true },
        { lat: 39.950567, lng: -75.193055, isOpen: true },
        { lat: 39.950467, lng: -75.193129, isOpen: true },
        { lat: 39.950479, lng: -75.193219, isOpen: true },
        { lat: 39.950486, lng: -75.193270, isOpen: true },
        { lat: 39.950492, lng: -75.193318, isOpen: true },
        { lat: 39.950499, lng: -75.193388, isOpen: true },
        { lat: 39.950512, lng: -75.193479, isOpen: true },
        { lat: 39.950523, lng: -75.193565, isOpen: true },
        { lat: 39.950534, lng: -75.193655, isOpen: true },
        { lat: 39.950549, lng: -75.193784, isOpen: true },
        { lat: 39.950596, lng: -75.194150, isOpen: true },
        { lat: 39.950610, lng: -75.194256, isOpen: true },
        { lat: 39.950624, lng: -75.194376, isOpen: true },
        { lat: 39.950641, lng: -75.194507, isOpen: true },
        { lat: 39.950649, lng: -75.194590, isOpen: true },
        { lat: 39.950658, lng: -75.194666, isOpen: true },
        { lat: 39.950729, lng: -75.194377, isOpen: true },
        { lat: 39.950735, lng: -75.194430, isOpen: true },
        { lat: 39.950747, lng: -75.194510, isOpen: true },
        { lat: 39.950752, lng: -75.194587, isOpen: true },
        { lat: 39.950763, lng: -75.194670, isOpen: true }
    ],

    initMap() {

        this.map = new google.maps.Map( this.els.container, {
          center: { lat: 39.9505611, lng: -75.1937014 },
          disableDefaultUI: true,
          zoom: 19
        } )

        this.model.get()
        .then( data =>
            data.forEach( datum =>
                new google.maps.Marker( {
                    position: { lat: datum.location[1], lng: datum.location[0] },
                    map: this.map,
                    draggable: false,
                    icon: this.getIcon( datum.data )
                } )
            )
        )
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
