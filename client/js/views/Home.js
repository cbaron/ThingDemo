module.exports = Object.assign( {}, require('./__proto__'), {

    getHeight() { return window.innerHeight - this.views.header.els.container.clientHeight },
    
    onNavigation( path ) {
        const name = path[0]
        let promiseChain = undefined

        if( this.currentView === name ) return

        this.views.sidebar.onNavigation( name )
       
        promiseChain = ( this.currentView ? this.views[ this.currentView ].hide() : Promise.resolve() ).then( () => Promise.resolve( this.currentView = name ) )

        if( this.views[ name ] ) return promiseChain.then( () => this.views[ name ].show() ).catch( this.Error )

         promiseChain.then( () =>
             Promise.resolve(
                 this.views[ name ] =
                    this.factory.create(
                        name,
                        Object.assign( {
                            insertion: { value: { el: this.els.content } },
                            height: { value: this.getHeight() },
                            opts: { value: { dates: this.views.header.getDates() } }
                        } )
                    )
             )
         )
        .catch( e => { this.Error(e); this.emit( 'navigate', '/' ) } )
    },

    postRender() {
        this.currentView = undefined

        this.views.header.on( 'dateChanged', ( el, e ) => {
            this.views[ this.currentView ].onDateChange( el, e )
        } );

        ( this.path[0] )
            ? this.onNavigation( this.path )
            : this.views.sidebar.els.list.children[0].click()

        return this
    },
    
    size() {
        if( this.views.api ) this.views.api.setHeight( this.getHeight() )
        if( this.views.geo ) this.views.geo.setHeight( this.getHeight() )
        return true
    }

} )
