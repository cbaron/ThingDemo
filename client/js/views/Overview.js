module.exports = Object.assign( {}, require('./__proto__'), {

    Views: {
        events: {
            opts: function() { return { dates: this.opts.dates } }
        }
    },

    postRender() {

        this.widgetViews = {}

        this.widgets.forEach( widget =>
            this.widgetViews[ widget.name ] = this.factory.create( 'widget', Object.assign( { model: { value: { data: widget } }, insertion: { value: { el: this.els.widgets } } } ) )
        )

        return this
    },

    widgets: [
        { icon: require('./templates/lib/tag'), label: 'Events', name: 'events', value: '98,665' },
        { icon: require('./templates/lib/wifi'), label: 'Sensor Nodes', name: 'nodes', value: 18 },
        { icon: require('./templates/lib/wifi'), label: 'Sensors Active', name: 'activeNodes', value: 18 },
        { icon: require('./templates/lib/wifi'), label: 'Open Spaces', name: 'openSpaces', value: 3 },
        { icon: require('./templates/lib/wifi'), label: 'Occupied Spaces', name: 'occupiedSpaces', value: 15 },
        { icon: require('./templates/lib/wifi'), label: 'Revenue', name: 'revenue', value: '$198,228' }
    ]

} )
