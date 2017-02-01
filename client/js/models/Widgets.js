module.exports = Object.assign( {}, require('./__proto__'), {

    handleEvent( data ) {
        this.data.revenue += 1.1

        if( data.data.isAvailable ) {
            this.data.openSpaces += 1
            this.data.occupiedSpaces -= 1
        } else {
            this.data.openSpaces -= 1
            this.data.occupiedSpaces += 1
        }

        this.data.totalEvents = parseInt( this.data.totalEvents ) + 1 

    },

    resource: 'widgets'

} )
