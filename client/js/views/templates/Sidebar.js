module.exports = p => {
    const list = p.map( item => `<li data-name="${item.name}" class="clearfix">${item.icon}<span class="label">${item.label}</span></li>` ).join('')
    return `<div>
        <div data-js="header" class="header">
            <img class="logo" src="/static/img/logo.png"/>
        </div>
        <ul data-js="list">${list}</ul>
    </div>`
}
