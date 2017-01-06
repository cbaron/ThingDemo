module.exports = Object.create( {

    create( name, opts ) {
        const lower = name
        name = name.charAt(0).toUpperCase() + name.slice(1)
        return Object.create(
            this.Views[ name ],
            Object.assign( {
                name: { value: name },
                factory: { value: this },
                template: { value: this.Templates[ name ] },
                user: { value: this.User },
                Views: { value: { } }
                }, opts )
        ).constructor()
        .on( 'navigate', route => require('../router').navigate( route ) )
        .on( 'deleted', () => delete (require('../router')).views[lower] )
    },

}, {
    Templates: { value: require('../.TemplateMap') },
    Views: { value: require('../.ViewMap') }
} )
