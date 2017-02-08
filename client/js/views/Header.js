module.exports = Object.assign( {}, require('./__proto__'), {

    events: {
        accountUi: 'click',
        logout: 'click'
    },

    onAccountUiClick() {
        this.els.accountUi.classList.toggle( 'showing' )
    },

    onLogoutClick() {
         this.user.logout()
    }

} )
