module.exports = p =>
`<div>
    <div>Select your project</div>
    <div>
        <ul>
            <li data-js="traffic">Philadelphia Traffic Density Score</li>
            <li data-js="parking">Philadelphia Parking Data</li>
        </ul>
        <div>
            <div data-js="first">
                <div>
                    <span>Category</span>
                    <span data-js="category"></span>
                    <span>Type</span>
                    <span data-js="type"></span>
                    <div data-js="connected">Not Connected</div>
                    <div>Select an option</div>
                    <select>
                        <option>Marketplace</option>
                        <option>Direct Connect</option>
                        <option>Remove</option>
                </div>
            </div>
            <div data-js-"marketplace">
                <div>Marketplace insertion details</div>
                <div>
                    <span>Current velocity:</span>
                    <span data-js="velocity">1,304 events per hour</span>
                </div>
                <div>
                    <span>Category value:</span>
                    <span data-js="value">High</span>
                </div>
                <div>
                    <span>Suggested CPM ask:</span>
                    <span data-js="cpm">$2.74</span>
                </div>
                <div>
                    <span>Enter minimum price: $</span>
                    <input data-js="price" type="text" />
                </div>
                <div>
                    <span>Devices:</span>
                    <span data-js="devices">All eligible devices</span>
                </div>
            </div>
            <div class="footer">
                <button data-js="next">Next</button>
            </div>
        </div>
    </div>
</div>`
