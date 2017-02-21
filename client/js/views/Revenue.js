module.exports = Object.assign( {}, require('./__proto__'), {

    Moment: require('moment'),

    curveLength: 300,
    rootRadius: 20,

    determineTotalRevenue() {
        this.totalRevenue = {
            x: this.root.x + this.curveLength + 200 + 50,
            y: this.padding * -.75,
            value: this.NumberFormat.format( Object.keys( this.categories ).reduce( ( memo, id ) => memo + this.categories[id].revenue, 0 ) )
        }
    },

    addText( categoryId ) {

        if( !categoryId ) {
   
            this.determineTotalRevenue() 
           
            this.d3.select( this.els.text )
                .append( 'text' )
                .attr( 'class', 'root' )
                .attr( 'x', this.root.x )
                .attr( 'y', this.root.y )
                .text('All')

            this.d3.select( this.els.text )
                .append( 'text' )
                .attr( 'class', 'root-revenue' )
                .attr( 'x', this.root.x + this.curveLength + 200 )
                .attr( 'y', this.padding * -.75 )
                .text( this.totalRevenue.value )

            this.d3.select( this.els.text )
                .append( 'text' )
                .attr( 'class', 'total' )
                .attr( 'x', this.totalRevenue.x )
                .attr( 'y', this.totalRevenue.y )
                .text( 'Total' )

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
                    .attr( 'class', 'category revenue' )
                    .attr( 'data-id', datum.id )
                    .attr( 'x', datum.x + 200 )
                    .attr( 'y', datum.y )
                    .text( this.NumberFormat.format( this.categories[ datum.id ].revenue ) )
            } )

        } else {

            this.categories[ categoryId ].subCategories.forEach( ( id, i ) => {

                this.d3.select( this.els.text )
                    .append( 'text' )
                    .attr( 'class', 'sub-category' )
                    .attr( 'x', this.subCategories[id].x )
                    .attr( 'y', this.subCategories[id].y )
                    .text( this.subCategories[id].label )

                this.d3.select( this.els.text )
                    .append( 'text' )
                    .attr( 'class', 'sub-category revenue' )
                    .attr( 'x', this.subCategories[id].x + 200 )
                    .attr( 'y', this.subCategories[id].y )
                    .text( this.NumberFormat.format( this.subCategories[id].revenue ) )
            } )
        }
    },

    createLines( categoryId ) {

        if( !categoryId ) {
            this.model.category.data.forEach( ( datum, i ) => {
                datum.stroke = this.colorScale(i)
                this.d3.select( this.els.lines )
                .append( 'path' )
                    .attr( 'class', 'category' )
                    .attr( 'data-id', datum.id )
                    .attr( 'd', this.line( [ [ this.root.x, this.root.y ], [ this.root.x + 100, datum.y ], [ datum.x, datum.y ] ] ) )
                    .style( 'stroke', datum.stroke )
                    .style( 'stroke-width', datum.size )
            } )
        } else {
           
            const root = this.categories[ categoryId ].root
            this.categories[ categoryId ].subCategories.forEach( ( id, i ) => {
                this.d3.select( this.els.lines )
                .append( 'path' )
                    .attr( 'class', 'sub-category' )
                    .attr( 'd', this.line( [ [ root.x, root.y ], [ root.x + 100, this.subCategories[id].y ], [ this.subCategories[id].x, this.subCategories[id].y ] ] ) )
                    .style( 'stroke', this.colorScale(i) )
                    .style( 'stroke-width', this.subCategories[id].size )
            } )
        }
    },

    createPoints( categoryId ) {
        if( !categoryId ) {
            this.model.category.data.forEach( ( datum, i ) => {
                this.d3.select( this.els.points )
                .append( 'circle' )
                    .attr( 'cx', datum.x )
                    .attr( 'cy', datum.y )
                    .attr( 'r', datum.size )
                    .attr( 'data-id', datum.id )
                    .style( 'fill', this.colorScale(i) )
                    .style( 'stroke', this.colorScale.invert(i) )
            } )
        } else {
            this.categories[ categoryId ].subCategories.forEach( ( id, i ) => {
                this.d3.select( this.els.points )
                .append( 'circle' )
                    .attr( 'cx', this.subCategories[id].x )
                    .attr( 'cy', this.subCategories[id].y )
                    .style( 'fill', this.colorScale(i) )
                    .style( 'stroke', this.colorScale.invert(i) )
            } )
        }
    },

    createVerticalScale( length ) {
        const scaleHeight = length * 30

        this.padding = 80 

        this.verticalScale =
            this.d3.scaleLinear()
                .domain( [ 0, length - 1 ] )
                .range( [ 0, scaleHeight ] )

        this.svgHeight = scaleHeight + this.padding * 2

        this.d3.select( this.els.svg )
        .style( 'height', this.svgHeight )
        
        this.d3.select( this.els.all )
        .attr( 'transform', `translate( 0, ${this.padding + ( this.padding * .25 )} )` )
    },
 
    reassignSizes() {
        this.d3.select( `svg .text .root-revenue` )
            .text( this.totalRevenue.value )       

        this.model.category.data.forEach( datum => {

            datum.size = this.categoryScale( this.categories[ datum.id ].revenue )

            this.d3.select( `svg .lines path[data-id='${datum.id}']` )
                .style( 'stroke-width', datum.size )
            
            this.d3.select( `svg .text .category.revenue[data-id='${datum.id}']` )
                .text( this.NumberFormat.format( this.categories[ datum.id ].revenue ) )
            
        } )
    },

    assignPoints( categoryId ) {
    
        if( !categoryId ) {    
            this.model.category.data.forEach( ( datum, i ) =>
                Object.assign( datum, {
                    size: this.categoryScale( this.categories[ datum.id ].revenue ),
                    x: this.root.x + this.curveLength,
                    y: this.verticalScale( i )
                } )
            )
        } else {
            this.categories[ categoryId ].subCategories.forEach( ( id, i ) =>
                Object.assign( this.subCategories[ id ], {
                    size: this.subCategoryScale( this.subCategories[ id ].revenue ),
                    x: this.root.x + this.curveLength,
                    y: this.verticalScale( i )
                } )
            )
        }
    },

    createCategoryRevenueScale() {
        this.categoryScale = this.d3.scaleLinear()
            .domain( this.domains.category )
            .range( [ 1, 20 ] )
    },

    createCategoryScales() {

        this.colorScale =
            this.d3.scaleLinear()
                .domain( [ 0, this.model.category.data.length - 1 ] )
                //.range( ["#1ddfc7", "#25e6b9" ] )
                .range( ["#81b441", "#25e6b9" ] )

        this.createCategoryRevenueScale()

        this.createVerticalScale( this.model.category.data.length )
    },

    createSubCategoryScales( categoryId ) {
   
        this.subCategoryScale = this.d3.scaleLinear()
            .domain( this.domains.categoryId[ categoryId ] )
            .range( [ 1, 20 ] )
    },

    d3: Object.assign( require('d3-selection'), require('d3-scale'), require('d3-shape'), require('d3-transition'), require('d3-ease') ),

    handleCategories() {
        this.domains = {
            category: [ Infinity, 0 ],
            categoryId: { }
        }

        this.categories = { }
        this.model.category.data.forEach( datum => {
            this.categories[ datum.id ] = { name: datum.name, label: datum.label, revenue: 0, subCategories: [ ] }
            this.domains.categoryId[ datum.id ] = [ Infinity, 0 ]
        } )

        this.subCategories = { }
        this.model.subCategory.data.forEach( datum => {
            this.subCategories[ datum.id ] = { name: datum.name, label: datum.label, categoryId: datum.categoryId, revenue: 0 }
            this.categories[ datum.categoryId ].subCategories.push( datum.id )
        } )
    },

    zeroRevenue() {
        this.domains.category = [ Infinity, 0 ]
        Object.keys( this.categories ).forEach( id => {
            this.categories[ id ].revenue = 0
            this.domains.categoryId[ id ] = [ Infinity, 0 ]
        } )
        Object.keys( this.subCategories ).forEach( id => this.subCategories[ id ].revenue = 0 )
    },

    handleRevenue() {
        this.model.revenue.data.forEach( datum => {
            const sum = parseInt( datum.sum ),
                  subCategory = this.subCategories[ datum.subCategoryId ]

            subCategory.revenue += sum
            this.categories[ subCategory.categoryId ].revenue += sum
        } )

        Object.keys( this.categories ).forEach( id => {
            const sum = this.categories[id].revenue

            if( sum < this.domains.category[0] ) this.domains.category[0] = sum
            if( sum > this.domains.category[1] ) this.domains.category[1] = sum

            this.categories[ id ].subCategories.forEach( subCategoryId => {
                const subCategorySum = this.subCategories[ subCategoryId ].revenue
            
                if( subCategorySum < this.domains.categoryId[id][0] ) this.domains.categoryId[id][0] = subCategorySum
                if( subCategorySum > this.domains.categoryId[id][1] ) this.domains.categoryId[id][1] = subCategorySum
            } )
        } )
    },

    transitionOut( id ) {
        const attrSelector = `[data-id="${id}"]`

        if( this.rootId === 0 ) {

            this.d3.selectAll(`svg .text .category:not(${ attrSelector })`).transition( this.t )
                .style( 'opacity', 0 )
                
            this.d3.selectAll( `svg .lines path.category` ).transition( this.t )
                .style( 'opacity', 0 )

            this.d3.selectAll(`svg .text .revenue:not(${ attrSelector })`).transition( this.t )
                .style( 'opacity', 0 )

        } else {
            
            this.d3.selectAll(`svg .text .sub-category:not(${ attrSelector })`).transition( this.t ).remove()

            this.d3.selectAll( `svg .lines path.sub-category` ).transition( this.t ).remove()

            this.d3.selectAll(`svg .text .sub-category.revenue`).transition( this.t ).remove()
        }

    },

    updateSubCategories() {
        this.transitionOut( this.rootId )
        this.showSubCategories( this.rootId, `[data-id="${this.rootId}"]` )
    },

    onCategoryClick( id ) {
        const attrSelector = `[data-id="${id}"]`

        this.transitionOut(id) 

        if( this.rootId === 0 ) {
           
            this.d3.select( `svg .text .root` )
                .transition( this.t )
                .style( 'opacity', 0 )
                .on( 'end', () => this.showSubCategories( id, attrSelector ) )

            this.rootId = id
        } else {
            const categoryData = this.model.category.data.find( model => model.id === id )
            
            this.createVerticalScale( this.model.category.data.length )

            this.d3.selectAll(`svg .text .sub-category:not(${ attrSelector })`).remove()
            this.d3.selectAll( `svg .lines path.sub-category` ).remove()
            this.d3.selectAll(`svg .text .sub-category.revenue`).remove()

            this.d3.select( `svg .text .category${ attrSelector }` )
                .transition( this.t )
                .attr( 'x', categoryData.x )
                .attr( 'y', categoryData.y )
                .on( 'end', () => {

                this.d3.select( `svg .points .root` )
                    .transition(this.t)
                    .attr( 'cx', this.root.x )
                    .attr( 'cy', this.root.y )

                    this.d3.select( `svg .text .root-revenue` )
                    .transition( this.t )
                    .text( this.totalRevenue.value )

                    this.d3.selectAll( `svg .text .revenue${ attrSelector }` )
                        .transition( this.t )
                        .attr( 'x', categoryData.x + 200 )
                        .attr( 'y', categoryData.y )
                        .style( 'opacity', 1 )

                    this.d3.select( `svg .text .root` )
                        .transition( this.t )
                        .style( 'opacity', 1 )

                    this.d3.selectAll( `svg .text .category:not(${ attrSelector })` )
                        .transition( this.t )
                        .style( 'opacity', 1 )
                    
                    this.d3.selectAll( `svg .text .category.revenue:not(${ attrSelector })` )
                        .transition( this.t )
                        .style( 'opacity', 1 )
                    
                    this.d3.selectAll( `svg .lines path.category` )
                        .transition( this.t )
                        .style( 'opacity', 1 )
                } )
            
            this.rootId = 0
        }
    },

    showSubCategories( categoryId, attrSelector ) {

        this.createSubCategoryScales( categoryId )
        
        this.createVerticalScale( this.categories[ categoryId ].subCategories.length )

        if( !this.categories[ categoryId ].root ) {
            this.categories[ categoryId ].root = {
                x: ( this.els.svg.clientWidth / 4 ),
                y: ( this.svgHeight / 2 ) - this.padding
            }
        }
        
        const revenueSelection = this.d3.select( `svg .text .category.revenue${ attrSelector }` ),
            root = this.categories[ categoryId ].root

        revenueSelection
            .transition( this.t )
            .attr( 'x', this.totalRevenue.x )
            .attr( 'y', this.totalRevenue.y )
            .style( 'opacity', 0 )

        this.d3.select( `svg .text .root-revenue` )
        .transition( this.t )
        .text( revenueSelection.text() )

        this.d3.select( `svg .text .category${ attrSelector }` )
            .transition( this.t )
            .attr( 'x', root.x - ( this.rootRadius * 2 ) )
            .attr( 'y', root.y - ( this.rootRadius * 2 ) )
        
        this.d3.select( `svg .points .root` )
            .transition(this.t)
            .attr( 'cx', root.x )
            .attr( 'cy', root.y )               


        this.assignPoints( categoryId )
        
        this.createLines( categoryId )
        
        //this.createPoints( categoryId )
        
        this.addText( categoryId )
    },

    setHeight() {
        if( this.initialized ) {
        }
    },

    onDateChange( el, e ) {
        this.opts.dates[ el ] = this.Moment( e )

        if( this.opts.dates.to.isBefore( this.opts.dates.from ) ) return
        
        this.model.revenue.get( { query: this.opts.dates, role: this.user.data.role } )
        .then( () => {
            this.zeroRevenue()

            this.handleRevenue()

            this.createCategoryRevenueScale()

            this.determineTotalRevenue() 

            this.reassignSizes()

            if( this.rootId !== 0 ) this.updateSubCategories()
        } )
        .catch( e => this.Error )
    },

    postRender() {

        this.t = this.d3.transition()
                .duration( 750 )
                .ease( this.d3.easeLinear )

        this.rootId = 0

        this.model = {
            category: Object.create( this.Model, { resource: { value: 'category' } } ),
            revenue: Object.create( this.Model, { resource: { value: 'revenue' } } ),
            subCategory: Object.create( this.Model, { resource: { value: 'subCategory' } } )
        }

        Promise.all( [ 'revenue', 'category', 'subCategory' ].map( resource =>
            this.model[ resource ].get( resource === 'revenue' ? { query: this.opts.dates, role: this.user.data.role  } : {} ) )
        )
        .then( () => {

            this.handleCategories()

            this.handleRevenue()

            this.createCategoryScales() 

            this.root = {
                x: ( this.els.svg.clientWidth / 4 ),
                y: ( this.els.svg.clientHeight / 2 ) - this.padding
            }

            this.assignPoints()
                 
            this.line =
                this.d3.line()
                .curve( this.d3.curveBundle )

            this.createLines()

            this.d3.select( this.els.points )
                .append( 'circle' )
                .attr( 'class', 'root' )
                .attr( 'cx', this.root.x )
                .attr( 'cy', this.root.y )
                .attr( 'r', this.rootRadius )
                .style( 'stroke', this.colorScale(0) )
                .style( 'fill', this.colorScale( this.model.category.data.length - 1) )

            //this.createPoints()

            this.addText()

            this.initialized = true
            
        } )

        return this
    }

} )
