module.exports = Object.assign( {}, require('./__proto__'), {

    events: {
        accountUi: 'click'
    },

    onAccountUiClick() {
        this.els.accountUi.classList.toggle( 'showing' )
    },



} )
