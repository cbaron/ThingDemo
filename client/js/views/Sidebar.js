module.exports = Object.assign( {}, require('./__proto__'), {

    events: {
        list: 'click'
    },

    getTemplateOptions() { return this.data },

    data: [
        { icon: require('./templates/lib/home'), label: 'Overview', name: 'overview' },
        { icon: require('./templates/lib/dollar'), label: 'API Revenue', name: 'api' },
        { icon: require('./templates/lib/location'), label: 'Geo', name: 'firehose' }
    ],

    onListClick( e ) {
        const itemEl = e.target.tagName === "LI" ? e.target : e.target.closest('li')
        this.emit( 'clicked', itemEl.getAttribute('data-name') )
    },

    size() {
        this.els.list.style.height = `${this.els.container.clientHeight - this.els.header.clientHeight}px`
        return true
    }
} )
