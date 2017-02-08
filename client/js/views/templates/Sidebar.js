module.exports = p => {
    const list = p.map( item => `<li data-name="${item.name}" class="clearfix">${item.icon}<span class="label">${item.label}</span></li>` ).join('')
    return `<div>
        <div data-js="header" class="clearfix header">
            <img class="logo" src="/static/img/logo.png"/>
            ${require('./lib/justify')}
        </div>
        <div class="searchWrap">
            <input type="text" data-js="search" placeholder="Search..."/>
            ${require('./lib/search')}
        </div>
        <div class="title">Main Navigation</div>
        <ul data-js="list">${list}</ul>
    </div>`
}
