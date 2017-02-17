module.exports = Object.assign( {}, require('./__proto__'), {

    createView( name ) {
        this.views[ name ] =
            this.factory.create(
                name,
                Object.assign( {
                    insertion: { value: { el: this.els.content } },
                    height: { value: this.getHeight() },
                    opts: { value: { dates: this.views.heading.getDates() } }
                } )
            )
    },

    data: {
        overview: { headingText: 'Overview', showDates: true },
        revenue: { headingText: 'Revenue', showDates: true },
        admin: { headingText: 'Project Admin', showDates: false },
        geo: { headingText: 'Geo', showDates: false },
        activity: { headingText: 'Activity', showDates: false },
        marketplace: { headingText: 'Marketplace', showDates: false },
    },

    getHeight() { return window.innerHeight - this.views.heading.els.container.clientHeight },
    
    onNavigation( path ) {
        const name = path[0]

        if( this.currentView === name ) return

        this.views.sidebar.onNavigation( name );
       
        ( ( this.currentView ) 
            ? this.views[ this.currentView ].hide()
            : Promise.resolve()
        ).then( () =>
            ( ( this.views[ name ] )
                ? Promise.resolve( this.views[ name ].els.container.classList.remove( 'hidden', 'hide' ) )
                : Promise.resolve( this.createView( name ) ) )
        ).then( () => {
            this.currentView = name
            return Promise.resolve( this.updateHeading( name ) )
        } )
        .catch( e => this.Error(e) )
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
