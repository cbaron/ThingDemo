module.exports = Object.assign( {}, require('./__proto__'), {
    
    events: {
        submit: 'click'
    },

    onSubmitClick() {
        if( this.isSubmitting ) return

        this.isSubmitting = true

        this.validate()
        .then( () => {
            this.els.submit.classList.add('submitting')
            return this.Xhr( {
                data: JSON.stringify( { email: this.els.email.value, password: this.els.password.value } ),
                method: 'post',
                onProgress: this.onSubmitProgress.bind(this),
                resource: 'auth'
            } )
        } )
        .then( () => this.user.get() )
        .then( () => {
            this.els.submit.classList.remove('submitting')
            
            return this.LoadingBar.end()
            .then( () => this.hide() )
            .then( () => { this.submitting = false; return Promise.resolve( this.emit( 'loggedIn' ) ) } )
        } )
        .catch( e => {
            this.isSubmitting = false
            this.els.submit.classList.remove('submitting')
            this.Error(e);
            this.Toast.showError( e || 'Unknown server error')
            if( this.LoadingBar.status === 'started' ) this.LoadingBar.end()
        } )
    },

    onSubmitProgress( percent ) {
        if( percent === 'sent' ) return this.LoadingBar.start()

        this.LoadingBar.update( percent )
    },

    requiresLogin: false,

    validate() {
        if( this.els.email.value.trim() === '' ) return Promise.reject( 'Email is required' )
        if( this.els.password.value.trim() === '' ) return Promise.reject( 'Password is required' )
        return Promise.resolve()
    }

} )
