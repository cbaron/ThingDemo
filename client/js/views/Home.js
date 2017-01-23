module.exports = Object.assign( {}, require('./__proto__'), {
    
    handleSidebarClick( name ) {
        if( this.currentView === name ) return
       
        let promiseChain = ( this.currentView ? this.views[ this.currentView ].hide() : Promise.resolve() ).then( () => Promise.resolve( this.currentView = name ) )

        if( this.views[ name ] ) return promiseChain.then( () => this.views[ name ].show() ).catch( this.Error )

         promiseChain.then( () => Promise.resolve(
            this.views[ name ] =
                this.factory.create(
                    name,
                    Object.assign( { insertion: { value: { el: this.els.content } }, opts: { value: { dates: this.views.header.getDates() } } } )
                )
        ) )
        .then( () => Promise.resolve( name ===  'api' ? this.sizeApi() : undefined ) )
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
        if( this.views.api ) this.sizeApi()
        return true
    },

    sizeApi() {
        this.views.api.els.container.style.height = `${this.els.container.clientHeight - this.views.header.els.container.clientHeight}px`
    }
} )
