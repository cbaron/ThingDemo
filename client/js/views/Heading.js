const Moment =  require('moment')

module.exports = Object.assign( {}, require('./__proto__'), {

    Moment,

    Pikaday: require('../Pikaday'),

    getDates() {
        return { from: this.Moment( this.els.from.value ), to: this.Moment( this.els.to.value ) } 
    },

    handleDateSelect( el, e ) {
        this.emit( 'dateChanged', el, e )
    },

    postRender() {
        new this.Pikaday( { field: this.els.from, format: 'YYYY-MM-DD', onSelect: this.handleDateSelect.bind(this, 'from') } )
        new this.Pikaday( { field: this.els.to, format: 'YYYY-MM-DD', onSelect: this.handleDateSelect.bind(this, 'to') } )

        return this
    },

    templateOpts: {
        from: Moment('2017-01-01'),
        to: Moment()
    },

    update( obj ) {
        this.els.text.textContent = obj.headingText
        this.els.dateContainer.classList.toggle( 'hide', !obj.showDates )
    }
} )
