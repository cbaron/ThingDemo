module.exports = Object.assign( {}, require('./__proto__'), {
    
    events: {
        submit: 'click'
    },

    onSubmitClick() {
        this.els.submit.classList.add('submitting')
        this.Xhr( {
            data: JSON.stringify( { username: this.els.email.value, password: this.els.password.value } ),
            method: 'post',
            onProgress: this.onSubmitProgress.bind(this),
            resource: 'auth'
        } )
        .then( () => this.user.get() )
        .then( () => this.hide() )
        .then( () => Promise.resolve( this.emit( 'loggedIn' )) )
        .catch( e => { this.Error(e); this.Toast.showError( e || 'Unknown server error') } )
        .then( () => this.els.submit.classList.remove('submitting') )
    },

    onSubmitProgress( percent ) {
        console.log('asd')
        console.log(percent)
    },

    requiresLogin: false

} )
