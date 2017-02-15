module.exports = p => 
`<div>
    <div class="heading" data-js="heading"></div>
    <div>
        <svg data-js="graph" version="1.1" xmlns="http://www.w3.org/2000/svg">
            <g data-js="scale">
                <g class="axis" data-js="xAxis"></g>
                <g class="axis" data-js="yAxis"></g>
                <g class="areas" data-js="areas"></g>
                <g class="lines" data-js="lines"></g>
                <g class="points" data-js="points"></g>
            </g>
        </svg>
    </div>
</div>`
