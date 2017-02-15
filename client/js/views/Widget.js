module.exports = Object.assign( {}, require('./__proto__'), {

    events: {
        container: 'click'
    },

    onContainerClick() { this.emit('clicked') },

    value( value ) { this.els.value.textContent = `${value}` }

} )
