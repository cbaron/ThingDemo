module.exports = p => 
`<div>
    <div>
        <img src="/static/img/logo.png" />
    </div>
    <div>
        <div class="heading">Sign in to your account</div>
        <div class="form-box">
            <div class="prompt">Please enter your name and password to log in.</div>
            <div class="form-group">
                <input type="text" data-js="email" placeholder="Email" />
                ${require('./lib/user')}
            </div>
            <div class="form-group">
                <input type="password" data-js="password" placeholder="Password" />
                ${require('./lib/lock')}
            </div>
            <div class="clearfix">
                <button data-js="submit" type="button">
                    <span>Login</span>
                    ${require('./lib/arrow')}
                </button>
            </div>
        </div>
        <div class="copyright">${(new Date()).getFullYear()} &copy; Tellient (QC) by Tellient.</div>
    </div>
</div>`
