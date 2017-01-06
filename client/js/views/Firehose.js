module.exports = Object.assign( {}, require('./__proto__'), {

     //This changes the size of the component by adjusting the radius and width/height;
    changeSize( w, h ) {
        this.viz_container.transition().duration(300).style('width', w + 'px').style('height', h + 'px');
        this.viz.width(w).height(h*.8).update();
    },

    //This sets the same value for each radial progress
    changeData( val ) {
        this.valueField = this.valueFields[ Number(val) ];
        this.viz.update();
    },

    //This function is called when the user selects a different skin.
    changeSkin( val ) {
        if (val == "None") {
            this.theme.release()
        }
        else {
            this.theme.viz(viz)
            this.theme.skin(val)
        }

        this.viz().update();  //We could use theme.apply() here, but we want to trigger the tween.
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

    datatip: `<div class="tooltip" style="width: 250px; background-opacity:.5">` +
             `<div class="header1">HEADER1</div>` +
             `<div class="header-rule"></div>` +
             `<div class="header2"> HEADER2 </div>` +
             `<div class="header-rule"></div>` +
             `<div class="header3"> HEADER3 </div>` +
             `</div>`,

    formatCurrency(d) {
        if (isNaN(d)) d = 0; return "$" + d3.format(",.2f")(d) + " Billion";
     },

    initialize() {
        this.viz = vizuly.viz.weighted_tree( this.els.container )

        //Here we create three vizuly themes for each radial progress component.
        //A theme manages the look and feel of the component output.  You can only have
        //one component active per theme, so we bind each theme to the corresponding component.
        this.theme =
            vizuly.theme.weighted_tree( this.viz)
                        .skin(vizuly.skin.WEIGHTED_TREE_AXIIS)

        //Like D3 and jQuery, vizuly uses a function chaining syntax to set component properties
        //Here we set some bases line properties for all three components.
        this.viz.data(this.data)
                .width(this.els.container.clientWidth) 
                .height(this.els.container.clientHeight)
                .children( d => d.values )
                .key( d => d.id )
                .value( d => Number( d[ `agg_${this.valueField}` ] ) )
                .fixedSpan(-1)
                .label( d => this.trimLabel( d.key || (d[ `Level${d.depth}` ] ) ) )
                .on( "measure", this.onMeasure.bind(this) )
                .on( "mouseover", this.onMouseOver.bind(this) )
                .on( "mouseout", this.onMouseOut.bind(this) )
                .on( "click", this.onClick.bind(this) )

        //We use this function to size the components based on the selected value from the RadiaLProgressTest.html page.
        this.changeSize( this.els.container.clientWidth, this.els.container.clientHeight )
        this.initialized = true

        // Open up some of the tree branches.
        this.viz.toggleNode(this.data.values[2]);
        this.viz.toggleNode(this.data.values[2].values[0]);
        this.viz.toggleNode(this.data.values[3]);
    },

    loadData() {
        d3.csv("/static/data/weightedtree_federal_budget.csv", csv => {
            this.data.values = this.prepData( csv )
            this.initialize()
        });
    },

    onMeasure() {
       // Allows you to manually override vertical spacing
       // viz.tree().nodeSize([100,0]);
    },

    onMouseOver(e,d,i) {
        if (d == this.data) return;
        var rect = e.getBoundingClientRect();
        if (d.target) d = d.target; //This if for link elements
        this.createDataTip(rect.left, rect.top, (d.key || (d['Level' + d.depth])), this.formatCurrency(d["agg_" + this.valueField]), this.valueField);
    },

     onMouseOut(e,d,i) {
        d3.selectAll(".vz-weighted_tree-tip").remove();
    },

   //We can capture click events and respond to them
    onClick(e,d,i) {
        viz.toggleNode(d);
    },

    postRender() {
        // html element that holds the chart
        this.viz_container = undefined

        // our weighted tree
        this.viz = undefined

        // our theme
        this.theme = undefined

        // nested data
        this.data = {}

        // stores the currently selected value field
        this.valueField = "Federal";
        this.valueFields = ["Federal", "State", "Local"];

        // Set the size of our container element.
        this.viz_container = d3.selectAll("#viz")

        this.loadData();

        return this
    },

    prepData( csv ) {

        var values=[];

        //Clean federal budget data and remove all rows where all values are zero or no labels
        csv.forEach( d => {
            if( this.valueFields.reduce( ( memo, cur ) => memo + Number( d[ cur ] ), 0 ) > 0 ) values.push( d )
        } )

        //Make our data into a nested tree.  If you already have a nested structure you don't need to do this.
        var nest = d3.nest()
            .key( d => d.Level1 )
            .key( d => d.Level2 )
            .key( d => d.Level3 )
            .entries(values)

        //This will be a viz.data function;
        vizuly.data.aggregateNest( nest, this.valueFields, ( a, b ) => Number(a) + Number(b) )

        var node={};
        node.values = nest;
        this.removeEmptyNodes(node,"0","0");

        return nest;
    },

    //Remove empty child nodes left at end of aggregation and add unqiue ids
    removeEmptyNodes( node, parentId, childId ) {
        if (!node) return
        node.id = `${parentId}_${childId}`
        if (node.values) {
            for(var i = node.values.length - 1; i >= 0; i--) {
                node.id=parentId + "_" + i;
                if(!node.values[i].key && !node.values[i].Level4) {
                    node.values.splice(i, 1);
                }
                else {
                    this.removeEmptyNodes(node.values[i],node.id,i)
                }
            }
        }
    },

    size() {
        if( this.initialized ) this.changeSize( this.els.container.clientWidth, this.els.container.clientHeight )
        return true
    },

    trimLabel (label) {
       return (String(label).length > 20) ? String(label).substr(0, 17) + "..." : label
    }

} )
