module.exports = Object.assign( {}, require('./__proto__'), {

    Io: require('socket.io-client'),

    Moment: require('moment'),

    Views: {
        events: {
            opts: function() { return { dates: this.opts.dates } }
        }
    },

    onDateChange( el, e ) {
        this.opts.dates[ el ] = this.Moment( e )

        this.views.events.onDateChange( el, e )

        //this.updateWidgets()

    },

    populate( data ) {
        this.widgetViews.events.value( parseInt( data.totalEvents ).toLocaleString() )
        this.widgetViews.nodes.value( parseInt( data.sensorNodes ).toLocaleString() )
        this.widgetViews.activeNodes.value( parseInt( data.sensorsActive ).toLocaleString() )
        this.widgetViews.openSpaces.value( parseInt( data.openSpaces ).toLocaleString() )
        this.widgetViews.occupiedSpaces.value( parseInt( data.occupiedSpaces ).toLocaleString() )
        this.widgetViews.revenue.value( this.NumberFormat.format( data.revenue  ) )
    },

    postRender() {

        this.widgetViews = {}

        this.widgets.forEach( widget =>
            this.widgetViews[ widget.name ] = this.factory.create( 'widget', Object.assign( { model: { value: { data: widget } }, insertion: { value: { el: this.els.widgets } } } ) )
        )

        this.updateWidgets()

        return this
    },

    widgets: [
        { icon: require('./templates/lib/tag'), label: 'Events', name: 'events' },
        { icon: require('./templates/lib/wifi'), label: 'Sensor Nodes', name: 'nodes' },
        { icon: require('./templates/lib/wifi'), label: 'Sensors Active', name: 'activeNodes' },
        { icon: require('./templates/lib/openBox'), label: 'Open Spaces', name: 'openSpaces' },
        { icon: require('./templates/lib/garage'), label: 'Occupied Spaces', name: 'occupiedSpaces' },
        { icon: require('./templates/lib/dollar'), label: 'Revenue', name: 'revenue'  }
    ],

    widgetsModel: Object.create( require('../models/Widgets'), { } ),

    updateWidgets() {
        this.widgetsModel.get( { query: { dates: { to: this.opts.dates.to.toISOString(), from: this.opts.dates.from.toISOString() } } } )
        .then( data => {
            this.populate( data )
            
            this.Io().on( 'eventCreated', data => {
                console.log( data )
                this.widgetsModel.handleEvent( data )
                this.populate( this.widgetsModel.data )
            } )
        } )
        .catch( this.Error )
    }

} )
