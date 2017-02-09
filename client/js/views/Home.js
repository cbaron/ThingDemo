module.exports = Object.assign( {}, require('./__proto__'), {

    data: {
        overview: { headingText: 'Overview', showDates: true },
        api: { headingText: 'Api', showDates: true },
        admin: { headingText: 'Project Admin', showDates: false },
        geo: { headingText: 'Geo', showDates: false }
    },

    getHeight() { return window.innerHeight - this.views.heading.els.container.clientHeight },
    
    onNavigation( path ) {
        const name = path[0]
        let promiseChain = undefined

        if( this.currentView === name ) return

        this.views.sidebar.onNavigation( name )
       
        promiseChain = ( this.currentView ? this.views[ this.currentView ].hide() : Promise.resolve() ).then( () => Promise.resolve( this.currentView = name ) )

        if( this.views[ name ] ) {
            return promiseChain.then( () => {
                this.updateHeading( name )
                return this.views[ name ].show()
            } ).catch( this.Error )
        }


         promiseChain.then( () => {
             this.updateHeading( name )
             return Promise.resolve(
                 this.views[ name ] =
                    this.factory.create(
                        name,
                        Object.assign( {
                            insertion: { value: { el: this.els.content } },
                            height: { value: this.getHeight() },
                            opts: { value: { dates: this.views.heading.getDates() } }
                        } )
                    )
             )
         } )
        .catch( e => { this.Error(e); this.emit( 'navigate', '/' ) } )
    },

    postRender() {
        this.currentView = undefined

        this.views.heading.on( 'dateChanged', ( el, e ) => {
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
    },

    updateHeading( name ) {
        this.views.heading.update( this.data[ name ] )
    }

} )
