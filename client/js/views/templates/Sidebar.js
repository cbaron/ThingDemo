module.exports = p => {
    const list = p.map( item => `<li><span>`+require(`./lib/${item.icon}`)+`</span><span>${item.label}</span></li>` ).join('')
    return `<div>
        <div class="header">
            <img class="logo" src="/static/img/logo.png"/>
        </div>
        <ul>${list}</ul>
    </div>`
}
