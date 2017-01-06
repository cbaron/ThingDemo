module.exports = Object.assign( {}, require('./__proto__'), {
    
    size() {
        this.views.firehose.els.container.style.height = `${this.els.container.clientHeight - this.views.header.els.container.clientHeight}px`
        return true
    }
} )
