module.exports = Object.create( Object.assign( {}, require('./__proto__.js'), {

 isLoggedIn() {
        return Boolean( this.data && this.data.id )  
 }

 
} ), { resource: { value: 'me' } } )
