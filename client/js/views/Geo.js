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
            
            this.markers = { }
            this.icons = { }

            data.forEach( datum => {
                this.icons[ datum.id ] = this.getIcon( datum.data )

                this.markers[ datum.id ] =
                    new google.maps.Marker( {
                        animation: google.maps.Animation.DROP,
                        position: { lat: datum.location[1], lng: datum.location[0] },
                        map: this.map,
                        draggable: false,
                        icon: this.icons[ datum.id ]
                    } )
            } )
       
            this.Io().on( 'eventCreated', data => {
                if( this.icons[ data.sensorId ] ) {
                    this.icons[ data.sensorId ].fillColor = data.data.isAvailable ? 'gray' : 'green'
                    this.markers[ data.sensorId ].set( 'icon', this.icons[ data.sensorId ] )
                    this.markers[ data.sensorId ].setAnimation( google.maps.Animation.BOUNCE )
                    setTimeout( () => this.markers[ data.sensorId ].setAnimation( null ), 3000 )
                }
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
    }

} )
