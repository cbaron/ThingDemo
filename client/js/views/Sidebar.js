module.exports = Object.assign( {}, require('./__proto__'), {

    events: {
        justify: 'click',
        list: 'click',
        search: [ 'focus', 'blur' ]
    },

    getTemplateOptions() { return this.data },

    data: [
        { icon: require('./templates/lib/home'), label: 'Overview', name: 'overview' },
        { icon: require('./templates/lib/dollar'), label: 'Revenue', name: 'api' },
        { icon: require('./templates/lib/target'), label: 'Data API Admin', name: 'admin' },
        { icon: require('./templates/lib/location'), label: 'Geo', name: 'geo' },
        { icon: require('./templates/lib/grid'), label: 'Apps', name: 'apps' },
        { icon: require('./templates/lib/link'), label: 'Relationships', name: 'relationships' },
        { icon: require('./templates/lib/fullscreen'), label: 'Marketplace', name: 'marketplace' },
        { icon: require('./templates/lib/pulse'), label: 'Activity', name: 'activity' }
    ],

    onJustifyClick() {
        this.els.container.classList.toggle('minimize')
    },

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

    onSearchFocus() {
        this.els.searchIcon.style.opacity = '1'
    },
    
    onSearchBlur() {
        this.els.searchIcon.style.opacity = ''
    },

    size() {
        //this.els.list.style.height = `${this.els.container.clientHeight - this.els.header.clientHeight}px`
        return true
    }
} )
