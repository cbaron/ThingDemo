module.exports = p =>
`<div>
    <div class="header clearfix">
        <span class="heading">Overview</span>
        <div class="dates">
            <input type="text" data-js="from" value="${p.opts.from.format('YYYY-MM-DD')}" />
            <span>to</span>
            <input type="text" data-js="to" value="${p.opts.to.format('YYYY-MM-DD')}"/>
        </div>
    </div>
    <div data-js="widgets"></div>
    <div class="user-data-row clearfix">
        <div>
            <span class="label">Users</span>
            <span class="value">478</span>
        </div>
        <div>
            <span class="label">Userbases Active</span>
            <span class="value">81.5%</span>
        </div>
    </div>
    <div class="graph-wrap clearfix">
        <div data-view="events"></div>
        <div data-view="sensorsByNetwork"></div>
    </div>
</div>`
