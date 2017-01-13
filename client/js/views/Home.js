module.exports = Object.assign( {}, require('./__proto__'), {

    handleSidebarClick( name ) {
        if( this.views[ name ] ) return this.views[ name ].show()

        this.views[ name ] = this.factory.create( name, Object.assign( { insertion: { value: { el: this.els.main } } } ) )
    },

    postRender() {
        this.views.sidebar.on( 'clicked', this.handleSidebarClick.bind(this) )
        return this
    },
    
    size() {
        //this.views.firehose.els.container.style.height = `${this.els.container.clientHeight - this.views.header.els.container.clientHeight}px`
        return true
    }
} )
