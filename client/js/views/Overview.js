const Moment = require('moment')
module.exports = Object.assign( {}, require('./__proto__'), {

    Moment,

    Pikaday: require('../Pikaday'),

    Views: {
        events: {
            opts: function() { return { dates: Object.assign( {}, this.templateOpts ) } }
        }
    },

    handleDateSelect( el, e ) {
        this.views.events.dateChanged( el, e )
    },

    postRender() {

        this.widgetViews = {}
        this.widgets.forEach( widget =>
            this.widgetViews[ widget.name ] = this.factory.create( 'widget', Object.assign( { model: { value: { data: widget } }, insertion: { value: { el: this.els.widgets } } } ) )
        )

        new this.Pikaday( { field: this.els.from, format: 'YYYY-MM-DD', onSelect: this.handleDateSelect.bind(this, 'from') } )
        new this.Pikaday( { field: this.els.to, format: 'YYYY-MM-DD', onSelect: this.handleDateSelect.bind(this, 'to') } )

        return this
    },

    templateOpts: {
        from: Moment('2017-01-01'),
        to: Moment()
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
