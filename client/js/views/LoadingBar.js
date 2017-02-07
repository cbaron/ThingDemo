module.exports = Object.create( Object.assign( {}, require('./__proto__'), {

    continue() {
        const value = this.getValue() + 5

        if( value < 95 && this.status !== 'ended' ) {
            this.els.bar.style.width = '${value}%'
            this.continueId = setTimeout( () => this.continue(), 750 )
        }
    },

    end() {
        return new Promise( ( resolve, reject ) => {
            
            if( this.status === 'started' && this.els.container.classList.contains('hide') ) {
                this.status = 'ended'
                return this.once( 'shown', () => this.end().then( resolve ).catch( reject ) )
            }
        
            this.status = 'ended'

            if( this.continueId ) clearTimeout( this.continueId )

            this.els.bar.style.width = ''

            this.hide().then( resolve ).catch( reject )
        } )
    },

    getValue() { return this.els.bar.style.width.slice( 0, this.els.bar.style.width.length - 2 ) },

    insertion: { el: document.body },

    name: 'LoadingBar',

    postRender() {
        return this
    },

    requiresLogin: false,

    start() {
        this.status = 'started'
        this.els.bar.style.width = '5%'

        return this.show()
        .then( () => this.continue() )
        .catch( this.Error )
    },

    template: require('./templates/LoadingBar'),

    update( percent ) {
        if( percent > this.getValue ) this.els.bar.style.width = percent
        
    },

} ), { } ).constructor()
