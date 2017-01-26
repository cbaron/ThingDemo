module.exports = Object.assign( {}, require('./__proto__'), {

    events: {
        list: 'click'
    },

    getTemplateOptions() { return this.data },

    data: [
        { icon: require('./templates/lib/home'), label: 'Overview', name: 'overview' },
        { icon: require('./templates/lib/dollar'), label: 'API Revenue', name: 'api' },
        { icon: require('./templates/lib/location'), label: 'Geo', name: 'geo' }
    ],

    onListClick( e ) {
        const itemEl = e.target.tagName === "LI" ? e.target : e.target.closest('li'),
              name = itemEl.getAttribute('data-name')

        this.onNavigation( name )

        this.emit( 'navigate', `/${name}` )
    },

    onNavigation( name ) {
        const el = this.els.list.querySelector( `li[data-name="${name}"]` )

        if( !el ) return 

        if( this.selectedEl ) this.selectedEl.classList.remove('selected')

        el.classList.add('selected')
        this.selectedEl = el
    },

    size() {
        //this.els.list.style.height = `${this.els.container.clientHeight - this.els.header.clientHeight}px`
        return true
    }
} )
