module.exports = Object.create( Object.assign( {}, require('./__proto__'), {

    Icons: {
        error: require('./templates/lib/error')
    },

    insertion: { el: document.body },

    name: 'Toast',

    postRender() {
        return this
    },

    requiresLogin: false,

    showError( message ) {
        this.els.message.textContent = message
        this.els.title.textContent = 'Error'
        this.slurpTemplate( { insertion: { el: this.els.icon }, template: this.Icons.error } )

        this.show()
        .then( () => this.hide() )
        .then( () => this.teardown() )
        .catch( this.Error )
    },

    teardown() {
        this.els.message.textContent = ''
        this.els.message.title = ''
        this.els.icon.removeChild( this.els.icon.firstChild )
    },

    template: require('./templates/Toast')

} ), { } ).constructor()
