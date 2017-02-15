module.exports = Object.create( Object.assign( {}, require('./__proto__.js'), {

 isLoggedIn() {
        return Boolean( this.data && this.data.id )  
 },

 logout() {
     document.cookie = `tellient=; expires=Thu, 01 Jan 1970 00:00:01 GMT;`

     this.data = { }
     this.emit('logout')
 },

 parse( response ) {
     if( response.roles.length ) response.role = response.roles[0]
     return response
 },
 
} ), { resource: { value: 'me' } } )
