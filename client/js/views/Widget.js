module.exports = Object.assign( {}, require('./__proto__'), {
    value( value ) { this.els.value.textContent = `${value}` }
} )
