module.exports = Object.assign( {}, require('./__proto__'), {

    getTemplateOptions() { return this.data },

    data: [
        { icon: 'home', label: 'Overview' },
        { icon: 'dollar', label: 'API Revenue' },
        { icon: 'location', label: 'Geo' }
    ]
} )
