module.exports = p =>
`<div class="clearfix">
    <span data-js="text" class="heading"></span>
    <div data-js="dateContainer" class="dates">
        <input type="text" data-js="from" value="${p.opts.from.format('YYYY-MM-DD')}" />
        <span>to</span>
        <input type="text" data-js="to" value="${p.opts.to.format('YYYY-MM-DD')}"/>
    </div>
</div>`
