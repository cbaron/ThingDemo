module.exports = p => {
    const list = p.map( item => `<li><span>logo</span><span>${item}</span></li>` ).join('')
    return `<div>
        <div>
            <span>logo</span>
            <span>Tellient</span>
        </div>
        <div>
            <span>Search</span>
            <span>icon</span>
        </div>
        <ul>${list}</ul>
    </div>`
}
