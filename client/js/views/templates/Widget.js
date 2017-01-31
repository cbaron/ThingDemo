module.exports = p =>
`<div class="${p.name}">
    <div>${p.icon}</div>
    <div data-js="value" class="value">${p.value || '&nbsp;'}</div>
    <div class="label">${p.label}</div>
</div>`
