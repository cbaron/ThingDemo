module.exports = Object.create( Object.assign( {}, require('./__proto__'), {

    Icons: {
        error: require('./templates/lib/error')
    },

    insertion: { el: document.body },

    name: 'Toast',

    postRender() {

        this.on( 'shown', () => this.status = 'shown' )
        this.on( 'hidden', () => this.status = 'hidden' )

        return this
    },

    requiresLogin: false,

    showError( message ) {
        if( /show/.test( this.status ) ) this.teardown()

        this.els.message.textContent = message
        this.els.title.textContent = 'Error'
        this.slurpTemplate( { insertion: { el: this.els.icon }, template: this.Icons.error } )
        
        this.status = 'showing'

        this.show()
        .then( () => this.hide() )
        .then( () => this.teardown() )
        .catch( this.Error )
    },

    teardown() {
        this.els.message.textContent = ''
        this.els.message.title = ''
        if( this.els.icon.firstChild ) this.els.icon.removeChild( this.els.icon.firstChild )
    },

    template: require('./templates/Toast')

} ), { } ).constructor()
