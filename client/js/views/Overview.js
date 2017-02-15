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

    onWidgetClick( name ) {
        if( this.selectedWidget ) this.widgetViews[ this.selectedWidget ].els.container.classList.remove('selected')

        this.widgetViews[ name ].els.container.classList.add('selected')
        this.views.events.onWidgetSelect( name )
        this.selectedWidget = name
    },

    populate( data ) {
        this.widgetViews.events.value( parseInt( data.events ).toLocaleString() )
        this.widgetViews.nodes.value( parseInt( data.sensors ).toLocaleString() )
        this.widgetViews.deployments.value( parseInt( data.deployments ).toLocaleString() )
        this.widgetViews.activeNodes.value( parseInt( data.activeSensors ).toLocaleString() )
        this.widgetViews.apps.value( parseInt( data.apps ).toLocaleString() )
        this.widgetViews.revenue.value( this.NumberFormat.format( data.revenue ) )
    },

    postRender() {

        this.widgetViews = {}

        this.widgets.forEach( widget =>
            this.widgetViews[ widget.name ] =
                this.factory.create( 'widget', Object.assign( { model: { value: { data: widget } }, insertion: { value: { el: this.els.widgets } } } ) )
                .on( 'clicked', () => this.onWidgetClick( widget.name ) )
        )

        this.updateWidgets()
        .then( () =>
            Promise.resolve(
                this.widgetViews[ this.widgets[0].name ].els.container.click()
            )
        )
        .catch( this.Error )

        return this
    },

    widgets: [
        { icon: require('./templates/lib/tag'), label: 'Events', name: 'events' },
        { icon: require('./templates/lib/wifi'), label: 'Sensor Nodes', name: 'nodes' },
        { icon: require('./templates/lib/openBox'), label: 'Deployments', name: 'deployments' },
        { icon: require('./templates/lib/wifi'), label: 'Sensors Active', name: 'activeNodes' },
        { icon: require('./templates/lib/grid'), label: 'Apps', name: 'apps' },
        { icon: require('./templates/lib/dollar'), label: 'Revenue', name: 'revenue'  }
    ],

    widgetsModel: Object.create( require('../models/Widgets'), { } ),

    updateWidgets() {
        return this.widgetsModel.get( { query: { dates: { to: this.opts.dates.to.toISOString(), from: this.opts.dates.from.toISOString() } } } )
        .then( data => {
            this.populate( data )
            
            this.Io().on( 'eventCreated', data => {
                this.widgetsModel.handleEvent( data )
                this.populate( this.widgetsModel.data )
            } )
        } )
    }

} )
