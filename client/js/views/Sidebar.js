module.exports = Object.assign( {}, require('./__proto__'), {

    events: {
        justify: 'click',
        list: 'click',
        search: [ 'focus', 'blur' ]
    },

    getTemplateOptions() {
        const role = this.user.data.role ? this.user.data.role.role : ''
        return this.data.filter( datum => datum.roles[ this.user.data.role.role ] )
    },

    data: [
        { icon: require('./templates/lib/home'), label: 'Overview', name: 'overview', roles: { network: true } },
        { icon: require('./templates/lib/dollar'), label: 'Revenue', name: 'api', roles: { network: true } },
        { icon: require('./templates/lib/target'), label: 'Data API Admin', name: 'admin', roles: { } },
        { icon: require('./templates/lib/location'), label: 'Geo', name: 'geo', roles: { network: true } },
        { icon: require('./templates/lib/grid'), label: 'Apps', name: 'apps', roles: { } },
        { icon: require('./templates/lib/link'), label: 'Relationships', name: 'relationships', roles: { } },
        { icon: require('./templates/lib/pulse'), label: 'Activity', name: 'activity', roles: { network: true } },
        { icon: require('./templates/lib/fullscreen'), label: 'Marketplace', name: 'marketplace', roles: { network: true } }
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
