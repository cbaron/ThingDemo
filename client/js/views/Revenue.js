module.exports = Object.assign( {}, require('./__proto__'), {

    curveLength: 300,
    rootRadius: 20,

    addText() {
        this.d3.select( this.els.text )
            .append( 'text' )
            .attr( 'class', 'root' )
            .attr( 'x', this.root.x )
            .attr( 'y', this.root.y )
            .text('All')

        this.model.category.data.forEach( ( datum, i ) => {

            this.d3.select( this.els.text )
                .append( 'text' )
                .attr( 'class', 'category' )
                .attr( 'data-id', datum.id )
                .attr( 'x', datum.x )
                .attr( 'y', datum.y )
                .text( datum.label )
                .on( 'click', () => this.onCategoryClick( datum.id ) )

            this.d3.select( this.els.text )
                .append( 'text' )
                .attr( 'class', 'revenue' )
                .attr( 'data-id', datum.id )
                .attr( 'x', datum.x + 100 )
                .attr( 'y', datum.y )
                .text( this.NumberFormat.format( this.categories[ datum.id ].revenue ) )

        } )
    },

    assignPoints() {

        this.verticalScale =
            this.d3.scaleLinear()
                .domain( [ 0, this.model.category.data.length ] )
                .range( [ 20, this.height - 20 ] )

        this.root = {
            x: ( this.els.svg.clientWidth / 2 ) - ( this.curveLength / 2 ),
            y: this.model.y = this.els.svg.clientHeight / 2
        }

        this.model.category.data.forEach( ( datum, i ) =>
            Object.assign( datum, {
                size: this.categoryScale( this.categories[ datum.id ].revenue ),
                x: this.root.x + this.curveLength,
                y: this.verticalScale( i )
            } )
        )
    },

    createScales() {

        this.colorScale =
            this.d3.scaleLinear()
                .domain( [ 0, this.model.category.data.length - 1 ] )
                //.range( ["#1ddfc7", "#25e6b9" ] )
                .range( ["#81b441", "#25e6b9" ] )

        this.categoryScale = this.d3.scaleLinear()
            .domain( this.domains.category )
            .range( [ 1, 20 ] )
        
        this.subCategoryScale = this.d3.scaleLinear()
            .domain( this.domains.subCategory )
            .range( [ 1, 20 ] )
    },

    d3: Object.assign( require('d3-selection'), require('d3-scale'), require('d3-shape'), require('d3-transition'), require('d3-ease') ),

    handleData() {
        this.domains = {
            category: [ Infinity, 0 ],
            subCategory: [ Infinity, 0 ]
        }

        this.categories = this.model.category.data.reduce( ( memo, datum ) => Object.assign( memo, { [ datum.id ]: { name: datum.name, label: datum.label, revenue: 0 } } ), { } )
        this.subCategories = this.model.subCategory.data.reduce( ( memo, datum ) => Object.assign( memo, { [ datum.id ]: { name: datum.name, label: datum.label, categoryId: datum.categoryId, revenue: 0 } } ), { } )

        this.model.revenue.data.forEach( datum => {
            const sum = parseInt( datum.sum ),
                  subCategory = this.subCategories[ datum.subCategoryId ]

            if( sum < this.domains.subCategory[0] ) this.domains.subCategory[0] = sum
            if( sum > this.domains.subCategory[1] ) this.domains.subCategory[1] = sum

            subCategory.revenue += sum
            this.categories[ subCategory.categoryId ].revenue += sum
        } )

        Object.keys( this.categories ).forEach( id => {
            const sum = this.categories[id].revenue
            if( sum < this.domains.category[0] ) this.domains.category[0] = sum
            if( sum > this.domains.category[1] ) this.domains.category[1] = sum
        } )
    },

    onCategoryClick( id ) {
        this.hide = this.d3.transition()
            .duration( 750 )
            .ease( this.d3.easeLinear )

        const line = this.d3.line(),
              attrSelector = `[data-id="${id}"]`

        this.d3.selectAll(`svg .text .category:not(${ attrSelector })`).transition( this.hide )
            .style( 'fill', 'transparent' )
            .style( 'stroke', 'transparent' )

        this.d3.selectAll(`svg .text .revenue:not(${ attrSelector })`).transition( this.hide )
            .style( 'fill', 'transparent' )
            .style( 'stroke', 'transparent' )
        
        this.d3.selectAll( `svg .lines path.category` ).transition( this.hide )
            .style( 'fill', 'transparent' )
            .style( 'stroke', 'transparent' )
            .on( 'end', () => {

                this.d3.select( `svg .text .root` )
                    .transition( this.hide )
                    .style( 'fill', 'transparent' )
                    .style( 'stroke', 'transparent' )

            this.d3.select( `svg .text .revenue${ attrSelector }` )
                    .transition( this.hide )
                    .style( 'x', this.els.container.clientWidth - 200 )
                    .style( 'y', 100 )

                this.d3.select( `svg .text .category${ attrSelector }` )
                    .transition( this.hide )
                    .attr( 'x', this.root.x - ( this.rootRadius * 2 ) )
                    .attr( 'y', this.root.y - ( this.rootRadius * 2 ) )
                    .on( 'end', () => this.showSubCategories( id ) )
            } )
    },

    showSubCategories( categoryId ) {
    },

    centerGraph() {
        let width = undefined
        this.d3.select('g.vz-weighted_tree-plot').select( function() { width = this.getBBox().width } )
        this.d3.select('g.vz-weighted_tree-plot')
            .attr( 'transform', `translate( ${7 + ( this.els.container.clientWidth - width ) / 2}, ${this.els.container.clientHeight / 2} )` )
    },

    setHeight( height ) {
        this.els.container.style.height = `${height}px`;

        if( this.initialized ) {
            this.changeSize( this.els.container.clientWidth, height )
            setTimeout( () => this.centerGraph(), 500 )
        }
    },

     //This changes the size of the component by adjusting the radius and width/height;
    changeSize( w, h ) {
        this.viz_container.transition().duration(300).style('width', w + 'px').style('height', h + 'px');
        this.viz.width(w).height(h).update();
    },

    //This sets the same value for each radial progress
    changeData( val ) {
        this.valueField = this.valueFields[ Number(val) ];
        this.viz.update();
    },

    // This function uses the above html template to replace values and then creates a new <div> that it appends to the
    // document.body.  This is just one way you could implement a data tip.
    createDataTip( x,y,h1,h2,h3 ) {

        var html = this.datatip.replace("HEADER1", h1);
        html = html.replace("HEADER2", h2);
        html = html.replace("HEADER3", h3);

        d3.select("body")
            .append("div")
            .attr("class", "vz-weighted_tree-tip")
            .style("position", "absolute")
            .style("top", y + "px")
            .style("left", (x - 125) + "px")
            .style("opacity",0)
            .html(html)
            .transition().style("opacity",1);
    },

    onDateChange( el, e ) {
        this.opts.dates[ el ] = this.Moment( e )

        if( this.opts.dates.to.isBefore( this.opts.dates.from ) ) return

        return
        this.clearGraph()

        this.setTimeScale()

        this.drawGraph()
    },

    postRender() {

        this.model = {
            category: Object.create( this.Model, { resource: { value: 'category' } } ),
            revenue: Object.create( this.Model, { resource: { value: 'revenue' } } ),
            subCategory: Object.create( this.Model, { resource: { value: 'subCategory' } } )
        }

        this.setHeight( this.height )

        Promise.all( [ 'revenue', 'category', 'subCategory' ].map( resource =>
            this.model[ resource ].get( resource === 'revenue' ? { query: this.opts.dates, role: this.user.data.role  } : {} ) )
        )
        .then( () => {

            this.handleData()

            this.createScales() 

            this.assignPoints()
                 
            this.line =
                this.d3.line()
                .curve( this.d3.curveBundle )

            this.model.category.data.forEach( ( datum, i ) => {
                this.d3.select( this.els.lines )
                .append( 'path' )
                    .attr( 'class', 'category' )
                    .attr( 'data-id', datum.id )
                    .attr( 'd', this.line( [ [ this.root.x, this.root.y ], [ this.root.x + 100, datum.y ], [ datum.x, datum.y ] ] ) )
                    .style( 'stroke', this.colorScale(i) )
                    .style( 'stroke-width', datum.size )
            } )

            this.d3.select( this.els.points )
                .append( 'circle' )
                .attr( 'cx', this.root.x )
                .attr( 'cy', this.root.y )
                .attr( 'r', this.rootRadius )
                .style( 'stroke', this.colorScale(0) )
                .style( 'fill', this.colorScale( this.model.category.data.length - 1) )

            this.model.category.data.forEach( ( datum, i ) => {
                this.d3.select( this.els.points )
                .append( 'circle' )
                    .attr( 'cx', datum.x )
                    .attr( 'cy', datum.y )
                    .attr( 'cy', datum.y )
                    .style( 'fill', this.colorScale(i) )
                    .style( 'stroke', this.colorScale.invert(i) )
            } )

            this.addText()
            
        } )

        return this;
            // html element that holds the chart
            this.viz_container = undefined

            // our weighted tree
            this.viz = undefined

            // our theme
            this.theme = undefined

            // nested data
            this.data = {}

            // stores the currently selected value field
            this.valueField = "revenue";
            this.valueFields = ["revenue"];

            // Set the size of our container element.
            this.viz_container = d3.selectAll("#viz")

            this.loadData();

        return this
    }

} )
