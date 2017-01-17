module.exports = Object.assign( {}, require('./__proto__'), {

    dateChanged( el, e ) {
        console.log('ad');
        console.log(el);
        console.log(e);
    },

    postRender() {
        console.log(this.opts);

        return this
    },
} )
