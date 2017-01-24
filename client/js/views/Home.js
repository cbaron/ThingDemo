module.exports = Object.assign( {}, require('./__proto__'), {

    getHeight() { return window.innerHeight - this.views.header.els.container.clientHeight },
    
    handleSidebarClick( name ) {
        if( this.currentView === name ) return
       
        let promiseChain = ( this.currentView ? this.views[ this.currentView ].hide() : Promise.resolve() ).then( () => Promise.resolve( this.currentView = name ) )

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
        .catch( this.Error )
    },

    postRender() {
        this.currentView = undefined

        this.views.sidebar.on( 'clicked', this.handleSidebarClick.bind(this) )
        this.views.sidebar.els.list.children[1].click()

        this.views.header.on( 'dateChanged', e => this.views[ this.currentView ].onDateChange( e ) )
        return this
    },
    
    size() {
        if( this.views.api ) this.views.api.setHeight( this.getHeight() )
        return true
    }

} )
