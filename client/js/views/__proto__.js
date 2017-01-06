module.exports = Object.assign( { }, require('../../../lib/MyObject'), require('events').EventEmitter.prototype, {

    OptimizedResize: require('./lib/OptimizedResize'),
    
    Xhr: require('../Xhr'),

    bindEvent( key, event ) {
        var els = Array.isArray( this.els[ key ] ) ? this.els[ key ] : [ this.els[ key ] ]
        els.forEach( el => el.addEventListener( event || 'click', e => this[ `on${this.capitalizeFirstLetter(key)}${this.capitalizeFirstLetter(event)}` ]( e ) ) )
    },

    capitalizeFirstLetter: string => string.charAt(0).toUpperCase() + string.slice(1),

    constructor() {


        return Object.assign( this, { els: { }, slurp: { attr: 'data-js', view: 'data-view' }, views: { } } ).render()
    },

    delegateEvents( key, el ) {
        var type = typeof this.events[key]

        if( type === "string" ) { this.bindEvent( key, this.events[key] ) }
        else if( Array.isArray( this.events[key] ) ) {
            this.events[ key ].forEach( eventObj => this.bindEvent( key, eventObj.event ) )
        } else {
            this.bindEvent( key, this.events[key].event )
        }
    },

    delete() {
        return this.hide()
        .then( () => {
            this.els.container.parentNode.removeChild( this.els.container )
            return Promise.resolve( this.emit('deleted') )
        } )
    },

    events: {},

    getData() {
        if( !this.model ) this.model = Object.create( this.Model, { resource: { value: this.name } } )

        return this.model.get()
    },

    getTemplateOptions() {
        return Object.assign(
            {},
            (this.model) ? this.model.data : {} ,
            { user: (this.user) ? this.user.data : {} },
            { opts: (this.templateOpts) ? this.templateOpts : {} }
        )
    },

    hide() {
        return new Promise( resolve => {
            if( !document.body.contains(this.els.container) || this.isHidden() ) return resolve()
            this.onHiddenProxy = e => this.onHidden(resolve)
            this.els.container.addEventListener( 'transitionend', this.onHiddenProxy )
            this.els.container.classList.add('hide')
        } )
    },

    htmlToFragment( str ) {
        let range = document.createRange();
        // make the parent of the first div in the document becomes the context node
        range.selectNode(document.getElementsByTagName("div").item(0))
        return range.createContextualFragment( str )
    },
    
    isHidden() { return this.els.container.classList.contains('hidden') },

    onHidden( resolve ) {
        this.els.container.removeEventListener( 'transitionend', this.onHiddenProxy )
        this.els.container.classList.add('hidden')
        resolve( this.emit('hidden') )
    },

    onLogin() {
        Object.assign( this, { els: { }, slurp: { attr: 'data-js', view: 'data-view' }, views: { } } ).render()
    },

    onShown( resolve ) {
        this.els.container.removeEventListener( 'transitionend', this.onShownProxy )
        if( this.size ) this.size()
        resolve( this.emit('shown') )
    },

    showNoAccess() {
        alert("No privileges, son")
        return this
    },

    postRender() { return this },

    render() {
        this.slurpTemplate( { template: this.template( this.getTemplateOptions() ), insertion: this.insertion } )

        this.renderSubviews()

        if( this.size ) { this.size(); this.OptimizedResize.add( this.size.bind(this) ) }

        return this.postRender()
    },

    renderSubviews() {
        Object.keys( this.Views || { } ).forEach( key => {
            if( this.Views[ key ].el ) {
                let opts = this.Views[ key ].opts
                
                opts = ( opts )
                    ? typeof opts === "object"
                        ? opts
                        : opts()
                    : {}

                this.views[ key ] = this.factory.create( key, Object.assign( { insertion: { value: { el: this.Views[ key ].el, method: 'insertBefore' } } }, opts ) )
                this.Views[ key ].el.remove()
                this.Views[ key ].el = undefined
            }
        } )

        return this
    },

    show( duration ) {
        return new Promise( resolve => {
            this.onShownProxy = e => this.onShown(resolve)
            this.els.container.addEventListener( 'transitionend', this.onShownProxy )
            this.els.container.classList.remove( 'hide', 'hidden' )
        } )
    },

    slurpEl( el ) {
        var key = el.getAttribute( this.slurp.attr ) || 'container'

        if( key === 'container' ) el.classList.add( this.name )

        this.els[ key ] = Array.isArray( this.els[ key ] )
            ? this.els[ key ].push( el )
            : ( this.els[ key ] !== undefined )
                ? [ this.els[ key ], el ]
                : el

        el.removeAttribute(this.slurp.attr)

        if( this.events[ key ] ) this.delegateEvents( key, el )
    },

    slurpTemplate( options ) {
        var fragment = this.htmlToFragment( options.template ),
            selector = `[${this.slurp.attr}]`,
            viewSelector = `[${this.slurp.view}]`

        this.slurpEl( fragment.querySelector('*') )
        fragment.querySelectorAll( `${selector}, ${viewSelector}` ).forEach( el => {
            if( el.hasAttribute( this.slurp.attr ) ) { this.slurpEl( el ) }
            else if( el.hasAttribute( this.slurp.view ) ) {
                if( ! this.Views[ el.getAttribute(this.slurp.view) ] ) this.Views[ el.getAttribute(this.slurp.view) ] = { }
                this.Views[ el.getAttribute(this.slurp.view) ].el = el
            }
        } )
          
        options.insertion.method === 'insertBefore'
            ? options.insertion.el.parentNode.insertBefore( fragment, options.insertion.el )
            : options.insertion.el[ options.insertion.method || 'appendChild' ]( fragment )

        return this
    }
} )
