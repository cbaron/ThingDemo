module.exports = p =>
`<div class="clearfix">
    <div class="accountUi" data-js="accountUi">
        <div data-js="email">${p.user.email}</div>
        <div>
            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="20" height="20" viewBox="0 0 20 20" xml:space="preserve">
                <path d="M0,0L10,10L20,0" />
            </svg>
    </div>
    <ul class="menu" data-js="menu">
        <li data-js="logout">Log Out</li>
    </ul>
</div>`
