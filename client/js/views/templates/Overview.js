module.exports = p =>
`<div>
    <div class="header clearfix">
        <span class="heading">Overview</span>
        <div class="dates">
            <input type="text" data-js="from" />
            <span>to</span>
            <input type="text" data-js="to" />
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
    <div>
        <div data-view="events"></div>
        <div data-js="sensors"></div>
    </div>
</div>`
