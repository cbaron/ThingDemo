module.exports = Object.create( Object.assign( {}, require('./__proto__'), {

    Icons: {
        error: require('./templates/lib/error')
    },

    insertion: { el: document.body },

    postRender() {
        console.log('asdasdad');
        return this
    },

    requiresLogin: false,

    showError( message ) {
        console.log(this.els);
        this.els.message.textContent = message
        this.els.title.textContent = 'Error'
        this.els.icon.appendChild( this.Icons.error )

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
