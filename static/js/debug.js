(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

module.exports = {
	Events: require('./views/templates/Events'),
	Firehose: require('./views/templates/Firehose'),
	Geo: require('./views/templates/Geo'),
	Header: require('./views/templates/Header'),
	Home: require('./views/templates/Home'),
	Overview: require('./views/templates/Overview'),
	Sidebar: require('./views/templates/Sidebar'),
	Widget: require('./views/templates/Widget')
};

},{"./views/templates/Events":18,"./views/templates/Firehose":19,"./views/templates/Geo":20,"./views/templates/Header":21,"./views/templates/Home":22,"./views/templates/Overview":23,"./views/templates/Sidebar":24,"./views/templates/Widget":25}],2:[function(require,module,exports){
'use strict';

module.exports = {
	Events: require('./views/Events'),
	Firehose: require('./views/Firehose'),
	Geo: require('./views/Geo'),
	Header: require('./views/Header'),
	Home: require('./views/Home'),
	Overview: require('./views/Overview'),
	Sidebar: require('./views/Sidebar'),
	Widget: require('./views/Widget')
};

},{"./views/Events":8,"./views/Firehose":9,"./views/Geo":10,"./views/Header":11,"./views/Home":12,"./views/Overview":13,"./views/Sidebar":14,"./views/Widget":15}],3:[function(require,module,exports){
"use strict";

module.exports = Object.create(Object.assign({}, require('../../lib/MyObject'), {

    Request: {
        constructor: function constructor(data) {
            var _this = this;

            var req = new XMLHttpRequest();

            return new Promise(function (resolve, reject) {

                req.onload = function () {
                    [500, 404, 401].includes(this.status) ? reject(this.response) : resolve(JSON.parse(this.response));
                };

                if (data.method === "get" || data.method === "options") {
                    var qs = data.qs ? "?" + data.qs : '';
                    req.open(data.method, "/" + data.resource + qs);
                    _this.setHeaders(req, data.headers);
                    req.send(null);
                } else {
                    req.open(data.method, "/" + data.resource, true);
                    _this.setHeaders(req, data.headers);
                    req.send(data.data);
                }
            });
        },
        plainEscape: function plainEscape(sText) {
            /* how should I treat a text/plain form encoding? what characters are not allowed? this is what I suppose...: */
            /* "4\3\7 - Einstein said E=mc2" ----> "4\\3\\7\ -\ Einstein\ said\ E\=mc2" */
            return sText.replace(/[\s\=\\]/g, "\\$&");
        },
        setHeaders: function setHeaders(req) {
            var headers = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            req.setRequestHeader("Accept", headers.accept || 'application/json');
            req.setRequestHeader("Content-Type", headers.contentType || 'text/plain');
        }
    },

    _factory: function _factory(data) {
        return Object.create(this.Request, {}).constructor(data);
    },
    constructor: function constructor() {

        if (!XMLHttpRequest.prototype.sendAsBinary) {
            XMLHttpRequest.prototype.sendAsBinary = function (sData) {
                var nBytes = sData.length,
                    ui8Data = new Uint8Array(nBytes);
                for (var nIdx = 0; nIdx < nBytes; nIdx++) {
                    ui8Data[nIdx] = sData.charCodeAt(nIdx) & 0xff;
                }
                this.send(ui8Data);
            };
        }

        return this._factory.bind(this);
    }
}), {}).constructor();

},{"../../lib/MyObject":32}],4:[function(require,module,exports){
'use strict';

module.exports = Object.create({
    create: function create(name, opts) {
        var lower = name;
        name = name.charAt(0).toUpperCase() + name.slice(1);
        return Object.create(this.Views[name], Object.assign({
            name: { value: name },
            factory: { value: this },
            template: { value: this.Templates[name] },
            user: { value: this.User },
            Views: { value: {} }
        }, opts)).constructor().on('navigate', function (route) {
            return require('../router').navigate(route);
        }).on('deleted', function () {
            return delete require('../router').views[lower];
        });
    }
}, {
    Templates: { value: require('../.TemplateMap') },
    Views: { value: require('../.ViewMap') }
});

},{"../.TemplateMap":1,"../.ViewMap":2,"../router":7}],5:[function(require,module,exports){
'use strict';

require('./polyfill');
window.initMap = function () {
  return true;
};
window.onload = function () {
  return require('./router');
};

},{"./polyfill":6,"./router":7}],6:[function(require,module,exports){
"use strict";

//https://developer.mozilla.org/en-US/docs/Web/API/Element/closest
if (window.Element && !Element.prototype.closest) {
    Element.prototype.closest = function (s) {
        var matches = (this.document || this.ownerDocument).querySelectorAll(s),
            i,
            el = this;
        do {
            i = matches.length;
            while (--i >= 0 && matches.item(i) !== el) {};
        } while (i < 0 && (el = el.parentElement));
        return el;
    };
}

module.exports = true;

},{}],7:[function(require,module,exports){
'use strict';

module.exports = Object.create({

    Error: require('../../lib/MyError'),

    ViewFactory: require('./factory/View'),

    Views: require('./.ViewMap'),

    constructor: function constructor() {
        this.contentContainer = document.querySelector('#content');

        window.onpopstate = this.handle.bind(this);

        this.handle();

        return this;
    },
    handle: function handle() {
        this.handler(window.location.pathname.split('/').slice(1));
    },
    handler: function handler(path) {
        var _this = this;

        var view = this.Views[path[0]] ? path[0] : 'home';

        (view === this.currentView ? Promise.resolve() : Promise.all(Object.keys(this.views).map(function (view) {
            return _this.views[view].hide();
        }))).then(function () {

            _this.currentView = view;

            if (_this.views[view]) return _this.views[view].onNavigation(path);

            return Promise.resolve(_this.views[view] = _this.ViewFactory.create(view, {
                insertion: { value: { el: _this.contentContainer } },
                path: { value: path, writable: true }
            }));
        }).catch(this.Error);
    },
    navigate: function navigate(location) {
        history.pushState({}, '', location);
        this.handle();
    }
}, { currentView: { value: '', writable: true }, views: { value: {} } }).constructor();

},{"../../lib/MyError":31,"./.ViewMap":2,"./factory/View":4}],8:[function(require,module,exports){
'use strict';

module.exports = Object.assign({}, require('./__proto__'), {});

},{"./__proto__":16}],9:[function(require,module,exports){
'use strict';

module.exports = Object.assign({}, require('./__proto__'), {

    //This changes the size of the component by adjusting the radius and width/height;
    changeSize: function changeSize(w, h) {
        this.viz_container.transition().duration(300).style('width', w + 'px').style('height', h + 'px');
        this.viz.width(w).height(h * .8).update();
    },


    //This sets the same value for each radial progress
    changeData: function changeData(val) {
        this.valueField = this.valueFields[Number(val)];
        this.viz.update();
    },


    //This function is called when the user selects a different skin.
    changeSkin: function changeSkin(val) {
        if (val == "None") {
            this.theme.release();
        } else {
            this.theme.viz(viz);
            this.theme.skin(val);
        }

        this.viz().update(); //We could use theme.apply() here, but we want to trigger the tween.
    },


    // This function uses the above html template to replace values and then creates a new <div> that it appends to the
    // document.body.  This is just one way you could implement a data tip.
    createDataTip: function createDataTip(x, y, h1, h2, h3) {

        var html = this.datatip.replace("HEADER1", h1);
        html = html.replace("HEADER2", h2);
        html = html.replace("HEADER3", h3);

        d3.select("body").append("div").attr("class", "vz-weighted_tree-tip").style("position", "absolute").style("top", y + "px").style("left", x - 125 + "px").style("opacity", 0).html(html).transition().style("opacity", 1);
    },


    datatip: '<div class="tooltip" style="width: 250px; background-opacity:.5">' + '<div class="header1">HEADER1</div>' + '<div class="header-rule"></div>' + '<div class="header2"> HEADER2 </div>' + '<div class="header-rule"></div>' + '<div class="header3"> HEADER3 </div>' + '</div>',

    formatCurrency: function formatCurrency(d) {
        if (isNaN(d)) d = 0;return "$" + d3.format(",.2f")(d) + " Billion";
    },
    initialize: function initialize() {
        var _this = this;

        this.viz = vizuly.viz.weighted_tree(this.els.container);

        //Here we create three vizuly themes for each radial progress component.
        //A theme manages the look and feel of the component output.  You can only have
        //one component active per theme, so we bind each theme to the corresponding component.
        this.theme = vizuly.theme.weighted_tree(this.viz).skin(vizuly.skin.WEIGHTED_TREE_AXIIS);

        //Like D3 and jQuery, vizuly uses a function chaining syntax to set component properties
        //Here we set some bases line properties for all three components.
        this.viz.data(this.data).width(this.els.container.clientWidth).height(this.els.container.clientHeight).children(function (d) {
            return d.values;
        }).key(function (d) {
            return d.id;
        }).value(function (d) {
            return Number(d['agg_' + _this.valueField]);
        }).fixedSpan(-1).label(function (d) {
            return _this.trimLabel(d.key || d['Level' + d.depth]);
        }).on("measure", this.onMeasure.bind(this)).on("mouseover", this.onMouseOver.bind(this)).on("mouseout", this.onMouseOut.bind(this)).on("click", this.onClick.bind(this));

        //We use this function to size the components based on the selected value from the RadiaLProgressTest.html page.
        this.changeSize(this.els.container.clientWidth, this.els.container.clientHeight);
        this.initialized = true;

        // Open up some of the tree branches.
        this.viz.toggleNode(this.data.values[2]);
        this.viz.toggleNode(this.data.values[2].values[0]);
        this.viz.toggleNode(this.data.values[3]);
    },
    loadData: function loadData() {
        var _this2 = this;

        d3.csv("/static/data/weightedtree_federal_budget.csv", function (csv) {
            _this2.data.values = _this2.prepData(csv);
            _this2.initialize();
        });
    },
    onMeasure: function onMeasure() {
        // Allows you to manually override vertical spacing
        // viz.tree().nodeSize([100,0]);
    },
    onMouseOver: function onMouseOver(e, d, i) {
        if (d == this.data) return;
        var rect = e.getBoundingClientRect();
        if (d.target) d = d.target; //This if for link elements
        this.createDataTip(rect.left, rect.top, d.key || d['Level' + d.depth], this.formatCurrency(d["agg_" + this.valueField]), this.valueField);
    },
    onMouseOut: function onMouseOut(e, d, i) {
        d3.selectAll(".vz-weighted_tree-tip").remove();
    },


    //We can capture click events and respond to them
    onClick: function onClick(e, d, i) {
        viz.toggleNode(d);
    },
    postRender: function postRender() {
        // html element that holds the chart
        this.viz_container = undefined;

        // our weighted tree
        this.viz = undefined;

        // our theme
        this.theme = undefined;

        // nested data
        this.data = {};

        // stores the currently selected value field
        this.valueField = "Federal";
        this.valueFields = ["Federal", "State", "Local"];

        // Set the size of our container element.
        this.viz_container = d3.selectAll("#viz");

        this.loadData();

        return this;
    },
    prepData: function prepData(csv) {
        var _this3 = this;

        var values = [];

        //Clean federal budget data and remove all rows where all values are zero or no labels
        csv.forEach(function (d) {
            if (_this3.valueFields.reduce(function (memo, cur) {
                return memo + Number(d[cur]);
            }, 0) > 0) values.push(d);
        });

        //Make our data into a nested tree.  If you already have a nested structure you don't need to do this.
        var nest = d3.nest().key(function (d) {
            return d.Level1;
        }).key(function (d) {
            return d.Level2;
        }).key(function (d) {
            return d.Level3;
        }).entries(values);

        //This will be a viz.data function;
        vizuly.data.aggregateNest(nest, this.valueFields, function (a, b) {
            return Number(a) + Number(b);
        });

        var node = {};
        node.values = nest;
        this.removeEmptyNodes(node, "0", "0");

        return nest;
    },


    //Remove empty child nodes left at end of aggregation and add unqiue ids
    removeEmptyNodes: function removeEmptyNodes(node, parentId, childId) {
        if (!node) return;
        node.id = parentId + '_' + childId;
        if (node.values) {
            for (var i = node.values.length - 1; i >= 0; i--) {
                node.id = parentId + "_" + i;
                if (!node.values[i].key && !node.values[i].Level4) {
                    node.values.splice(i, 1);
                } else {
                    this.removeEmptyNodes(node.values[i], node.id, i);
                }
            }
        }
    },
    size: function size() {
        if (this.initialized) this.changeSize(this.els.container.clientWidth, this.els.container.clientHeight);
        return true;
    },
    trimLabel: function trimLabel(label) {
        return String(label).length > 20 ? String(label).substr(0, 17) + "..." : label;
    }
});

},{"./__proto__":16}],10:[function(require,module,exports){
'use strict';

module.exports = Object.assign({}, require('./__proto__'), {

    data: [{ lat: 39.950614, lng: -75.193481, isOpen: true }, { lat: 39.950620, lng: -75.193398, isOpen: true }, { lat: 39.950595, lng: -75.193318, isOpen: true }, { lat: 39.950585, lng: -75.193241, isOpen: true }, { lat: 39.950573, lng: -75.193136, isOpen: true }, { lat: 39.950567, lng: -75.193055, isOpen: true }, { lat: 39.950467, lng: -75.193129, isOpen: true }, { lat: 39.950479, lng: -75.193219, isOpen: true }, { lat: 39.950486, lng: -75.193270, isOpen: true }, { lat: 39.950492, lng: -75.193318, isOpen: true }, { lat: 39.950499, lng: -75.193388, isOpen: true }, { lat: 39.950512, lng: -75.193479, isOpen: true }, { lat: 39.950523, lng: -75.193565, isOpen: true }, { lat: 39.950534, lng: -75.193655, isOpen: true }, { lat: 39.950549, lng: -75.193784, isOpen: true }, { lat: 39.950596, lng: -75.194150, isOpen: true }, { lat: 39.950610, lng: -75.194256, isOpen: true }, { lat: 39.950624, lng: -75.194376, isOpen: true }, { lat: 39.950641, lng: -75.194507, isOpen: true }, { lat: 39.950649, lng: -75.194590, isOpen: true }, { lat: 39.950658, lng: -75.194666, isOpen: true }, { lat: 39.950729, lng: -75.194377, isOpen: true }, { lat: 39.950735, lng: -75.194430, isOpen: true }, { lat: 39.950747, lng: -75.194510, isOpen: true }, { lat: 39.950752, lng: -75.194587, isOpen: true }, { lat: 39.950763, lng: -75.194670, isOpen: true }],

    initMap: function initMap() {
        var _this = this;

        this.map = new google.maps.Map(this.els.container, {
            center: { lat: 39.9505611, lng: -75.1947014 },
            disableDefaultUI: true,
            zoom: 18
        });

        this.data.forEach(function (datum) {
            datum.icon = {
                path: "M0 0 H 10 V 10 H 0 L 0 0",
                fillColor: datum.isOpen ? 'green' : 'red',
                fillOpacity: .6,
                anchor: new google.maps.Point(0, 0),
                strokeWeight: 0,
                scale: 1
            };

            datum.marker = new google.maps.Marker({
                position: { lat: datum.lat, lng: datum.lng },
                map: _this.map,
                draggable: false,
                icon: datum.icon
            });
        });

        setInterval(function () {
            return _this.toggleRandomSpot();
        }, 2000);
    },
    postRender: function postRender() {
        window.google ? this.initMap() : window.initMap = this.initMap;

        return this;
    },
    toggleRandomSpot: function toggleRandomSpot() {
        var datum = this.data[Math.floor(Math.random() * this.data.length)];

        datum.isOpen = !datum.isOpen;
        datum.icon.fillColor = datum.isOpen ? 'green' : 'red';
        datum.marker.set('icon', datum.icon);
    }
});

},{"./__proto__":16}],11:[function(require,module,exports){
'use strict';

module.exports = Object.assign({}, require('./__proto__'), {});

},{"./__proto__":16}],12:[function(require,module,exports){
'use strict';

module.exports = Object.assign({}, require('./__proto__'), {
    handleSidebarClick: function handleSidebarClick(name) {
        if (this.views[name]) return this.views[name].show();

        this.views[name] = this.factory.create(name, Object.assign({ insertion: { value: { el: this.els.main } } }));
    },
    postRender: function postRender() {
        this.views.sidebar.on('clicked', this.handleSidebarClick.bind(this));
        this.views.sidebar.els.list.firstChild.click();
        return this;
    },
    size: function size() {
        //this.views.firehose.els.container.style.height = `${this.els.container.clientHeight - this.views.header.els.container.clientHeight}px`
        return true;
    }
});

},{"./__proto__":16}],13:[function(require,module,exports){
'use strict';

module.exports = Object.assign({}, require('./__proto__'), {
    postRender: function postRender() {
        var _this = this;

        this.widgetViews = {};
        this.widgets.forEach(function (widget) {
            return _this.widgetViews[widget.name] = _this.factory.create('widget', Object.assign({ model: { value: { data: widget } }, insertion: { value: { el: _this.els.widgets } } }));
        });
        return this;
    },


    widgets: [{ icon: require('./templates/lib/tag'), label: 'Events', name: 'events', value: '98,665' }, { icon: require('./templates/lib/wifi'), label: 'Sensor Nodes', name: 'nodes', value: 18 }, { icon: require('./templates/lib/wifi'), label: 'Sensors Active', name: 'activeNodes', value: 18 }, { icon: require('./templates/lib/wifi'), label: 'Open Spaces', name: 'openSpaces', value: 3 }, { icon: require('./templates/lib/wifi'), label: 'Occupied Spaces', name: 'occupiedSpaces', value: 15 }, { icon: require('./templates/lib/wifi'), label: 'Revenue', name: 'revenue', value: '$198,228' }]

});

},{"./__proto__":16,"./templates/lib/tag":29,"./templates/lib/wifi":30}],14:[function(require,module,exports){
'use strict';

module.exports = Object.assign({}, require('./__proto__'), {

    events: {
        list: 'click'
    },

    getTemplateOptions: function getTemplateOptions() {
        return this.data;
    },


    data: [{ icon: require('./templates/lib/home'), label: 'Overview', name: 'overview' }, { icon: require('./templates/lib/dollar'), label: 'API Revenue', name: 'api' }, { icon: require('./templates/lib/location'), label: 'Geo', name: 'firehose' }],

    onListClick: function onListClick(e) {
        var itemEl = e.target.tagName === "LI" ? e.target : e.target.closest('li');
        this.emit('clicked', itemEl.getAttribute('data-name'));
    },
    size: function size() {
        this.els.list.style.height = this.els.container.clientHeight - this.els.header.clientHeight + 'px';
        return true;
    }
});

},{"./__proto__":16,"./templates/lib/dollar":26,"./templates/lib/home":27,"./templates/lib/location":28}],15:[function(require,module,exports){
'use strict';

module.exports = Object.assign({}, require('./__proto__'), {});

},{"./__proto__":16}],16:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

module.exports = Object.assign({}, require('../../../lib/MyObject'), require('events').EventEmitter.prototype, {

    OptimizedResize: require('./lib/OptimizedResize'),

    Xhr: require('../Xhr'),

    bindEvent: function bindEvent(key, event) {
        var _this = this;

        var els = Array.isArray(this.els[key]) ? this.els[key] : [this.els[key]];
        els.forEach(function (el) {
            return el.addEventListener(event || 'click', function (e) {
                return _this['on' + _this.capitalizeFirstLetter(key) + _this.capitalizeFirstLetter(event)](e);
            });
        });
    },


    capitalizeFirstLetter: function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    },

    constructor: function constructor() {

        return Object.assign(this, { els: {}, slurp: { attr: 'data-js', view: 'data-view' }, views: {} }).render();
    },
    delegateEvents: function delegateEvents(key, el) {
        var _this2 = this;

        var type = _typeof(this.events[key]);

        if (type === "string") {
            this.bindEvent(key, this.events[key]);
        } else if (Array.isArray(this.events[key])) {
            this.events[key].forEach(function (eventObj) {
                return _this2.bindEvent(key, eventObj.event);
            });
        } else {
            this.bindEvent(key, this.events[key].event);
        }
    },
    delete: function _delete() {
        var _this3 = this;

        return this.hide().then(function () {
            _this3.els.container.parentNode.removeChild(_this3.els.container);
            return Promise.resolve(_this3.emit('deleted'));
        });
    },


    events: {},

    getData: function getData() {
        if (!this.model) this.model = Object.create(this.Model, { resource: { value: this.name } });

        return this.model.get();
    },
    getTemplateOptions: function getTemplateOptions() {
        return Object.assign({}, this.model ? this.model.data : {}, { user: this.user ? this.user.data : {} }, { opts: this.templateOpts ? this.templateOpts : {} });
    },
    hide: function hide() {
        var _this4 = this;

        return new Promise(function (resolve) {
            if (!document.body.contains(_this4.els.container) || _this4.isHidden()) return resolve();
            _this4.onHiddenProxy = function (e) {
                return _this4.onHidden(resolve);
            };
            _this4.els.container.addEventListener('transitionend', _this4.onHiddenProxy);
            _this4.els.container.classList.add('hide');
        });
    },
    htmlToFragment: function htmlToFragment(str) {
        var range = document.createRange();
        // make the parent of the first div in the document becomes the context node
        range.selectNode(document.getElementsByTagName("div").item(0));
        return range.createContextualFragment(str);
    },
    isHidden: function isHidden() {
        return this.els.container.classList.contains('hidden');
    },
    onHidden: function onHidden(resolve) {
        this.els.container.removeEventListener('transitionend', this.onHiddenProxy);
        this.els.container.classList.add('hidden');
        resolve(this.emit('hidden'));
    },
    onLogin: function onLogin() {
        Object.assign(this, { els: {}, slurp: { attr: 'data-js', view: 'data-view' }, views: {} }).render();
    },
    onShown: function onShown(resolve) {
        this.els.container.removeEventListener('transitionend', this.onShownProxy);
        if (this.size) this.size();
        resolve(this.emit('shown'));
    },
    showNoAccess: function showNoAccess() {
        alert("No privileges, son");
        return this;
    },
    postRender: function postRender() {
        return this;
    },
    render: function render() {
        this.slurpTemplate({ template: this.template(this.getTemplateOptions()), insertion: this.insertion });

        this.renderSubviews();

        if (this.size) {
            this.size();this.OptimizedResize.add(this.size.bind(this));
        }

        return this.postRender();
    },
    renderSubviews: function renderSubviews() {
        var _this5 = this;

        Object.keys(this.Views || {}).forEach(function (key) {
            if (_this5.Views[key].el) {
                var opts = _this5.Views[key].opts;

                opts = opts ? (typeof opts === 'undefined' ? 'undefined' : _typeof(opts)) === "object" ? opts : opts() : {};

                _this5.views[key] = _this5.factory.create(key, Object.assign({ insertion: { value: { el: _this5.Views[key].el, method: 'insertBefore' } } }, opts));
                _this5.Views[key].el.remove();
                _this5.Views[key].el = undefined;
            }
        });

        return this;
    },
    show: function show(duration) {
        var _this6 = this;

        return new Promise(function (resolve) {
            _this6.onShownProxy = function (e) {
                return _this6.onShown(resolve);
            };
            _this6.els.container.addEventListener('transitionend', _this6.onShownProxy);
            _this6.els.container.classList.remove('hide', 'hidden');
        });
    },
    slurpEl: function slurpEl(el) {
        var key = el.getAttribute(this.slurp.attr) || 'container';

        if (key === 'container') el.classList.add(this.name);

        this.els[key] = Array.isArray(this.els[key]) ? this.els[key].push(el) : this.els[key] !== undefined ? [this.els[key], el] : el;

        el.removeAttribute(this.slurp.attr);

        if (this.events[key]) this.delegateEvents(key, el);
    },
    slurpTemplate: function slurpTemplate(options) {
        var _this7 = this;

        var fragment = this.htmlToFragment(options.template),
            selector = '[' + this.slurp.attr + ']',
            viewSelector = '[' + this.slurp.view + ']';

        this.slurpEl(fragment.querySelector('*'));
        fragment.querySelectorAll(selector + ', ' + viewSelector).forEach(function (el) {
            if (el.hasAttribute(_this7.slurp.attr)) {
                _this7.slurpEl(el);
            } else if (el.hasAttribute(_this7.slurp.view)) {
                if (!_this7.Views[el.getAttribute(_this7.slurp.view)]) _this7.Views[el.getAttribute(_this7.slurp.view)] = {};
                _this7.Views[el.getAttribute(_this7.slurp.view)].el = el;
            }
        });

        options.insertion.method === 'insertBefore' ? options.insertion.el.parentNode.insertBefore(fragment, options.insertion.el) : options.insertion.el[options.insertion.method || 'appendChild'](fragment);

        return this;
    }
});

},{"../../../lib/MyObject":32,"../Xhr":3,"./lib/OptimizedResize":17,"events":33}],17:[function(require,module,exports){
'use strict';

module.exports = Object.create({
    add: function add(callback) {
        if (!this.callbacks.length) window.addEventListener('resize', this.onResize.bind(this));
        this.callbacks.push(callback);
    },
    onResize: function onResize() {
        if (this.running) return;

        this.running = true;

        window.requestAnimationFrame ? window.requestAnimationFrame(this.runCallbacks.bind(this)) : setTimeout(this.runCallbacks, 66);
    },
    runCallbacks: function runCallbacks() {
        this.callbacks = this.callbacks.filter(function (callback) {
            return callback();
        });
        this.running = false;
    }
}, { callbacks: { writable: true, value: [] }, running: { writable: true, value: false } });

},{}],18:[function(require,module,exports){
"use strict";

module.exports = function (p) {
    return "<div>\n    <div class=\"header\">Events over time</div>\n    <div data-js=\"graph\"></div>\n</div>";
};

},{}],19:[function(require,module,exports){
"use strict";

module.exports = function (p) {
  return "<div id=\"viz\"></div>";
};

},{}],20:[function(require,module,exports){
"use strict";

module.exports = function (p) {
  return "<div></div>";
};

},{}],21:[function(require,module,exports){
"use strict";

module.exports = function (p) {
    return "<div>\n    <span>China Unicom</span>\n    <div>\n        <input data-js=\"from\" type=\"text\" />\n        <span>to</span>\n        <input data-js=\"to\" type=\"text\" />\n    </div>\n</div>";
};

},{}],22:[function(require,module,exports){
"use strict";

module.exports = function (p) {
    return "<div class=\"cleafix\">\n    <div data-view=\"sidebar\"></div>\n    <div data-js=\"main\" class=\"main\"></div>\n</div>";
};

},{}],23:[function(require,module,exports){
"use strict";

module.exports = function (p) {
    return "<div>\n    <div class=\"header clearfix\">\n        <span class=\"heading\">Overview</span>\n        <div class=\"dates\">\n            <input type=\"text\" data-js=\"from\" />\n            <span>to</span>\n            <input type=\"text\" data-js=\"to\" />\n        </div>\n    </div>\n    <div data-js=\"widgets\"></div>\n    <div class=\"user-data-row clearfix\">\n        <div>\n            <span class=\"label\">Users</span>\n            <span class=\"value\">478</span>\n        </div>\n        <div>\n            <span class=\"label\">Userbases Active</span>\n            <span class=\"value\">81.5%</span>\n        </div>\n    </div>\n    <div>\n        <div data-view=\"events\"></div>\n        <div data-js=\"sensors\"></div>\n    </div>\n</div>";
};

},{}],24:[function(require,module,exports){
'use strict';

module.exports = function (p) {
    var list = p.map(function (item) {
        return '<li data-name="' + item.name + '" class="clearfix">' + item.icon + '<span class="label">' + item.label + '</span></li>';
    }).join('');
    return '<div>\n        <div data-js="header" class="header">\n            <img class="logo" src="/static/img/logo.png"/>\n        </div>\n        <ul data-js="list">' + list + '</ul>\n    </div>';
};

},{}],25:[function(require,module,exports){
"use strict";

module.exports = function (p) {
    return "<div>\n    <div>" + p.icon + "</div>\n    <div data-js=\"value\" class=\"value\">" + p.value + "</div>\n    <div class=\"label\">" + p.label + "</div>\n</div>";
};

},{}],26:[function(require,module,exports){
"use strict";

module.exports = "<svg version=\"1.1\" id=\"Capa_1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\"\n\t width=\"611.994px\" height=\"611.994px\" viewBox=\"0 0 611.994 611.994\" style=\"enable-background:new 0 0 611.994 611.994;\"\n\t xml:space=\"preserve\">\n<g>\n    <path d=\"M306.009,481.303c-55.595,0-100.833-42.621-100.833-95.004c0-8.122,6.581-14.703,14.703-14.703\n        s14.703,6.581,14.703,14.703c0,36.169,32.041,65.6,71.427,65.6s71.415-29.431,71.415-65.6c0-36.17-32.035-65.599-71.415-65.599\n        c-55.595,0-100.833-42.621-100.833-95.004c0-52.384,45.238-95.004,100.833-95.004c29.854,0,57.988,12.351,77.196,33.887\n        c5.404,6.063,4.869,15.355-1.188,20.76c-6.058,5.411-15.354,4.87-20.76-1.188c-13.627-15.285-33.764-24.054-55.248-24.054\n        c-39.38,0-71.427,29.423-71.427,65.599c0,36.169,32.041,65.598,71.427,65.598c55.596,0,100.821,42.621,100.821,95.005\n        C406.836,438.682,361.604,481.303,306.009,481.303z\"/>\n    <path d=\"M303.315,525.235c-8.122,0-14.703-6.581-14.703-14.703v-409.07c0-8.122,6.581-14.703,14.703-14.703\n        c8.123,0,14.703,6.581,14.703,14.703v409.07C318.019,518.654,311.438,525.235,303.315,525.235z\"/>\n</g>\n</svg>";

},{}],27:[function(require,module,exports){
"use strict";

module.exports = "<svg version=\"1.1\" id=\"Capa_1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\"\n\t viewBox=\"0 0 58.365 58.365\" style=\"enable-background:new 0 0 58.365 58.365;\" xml:space=\"preserve\">\n<path d=\"M57.863,26.632l-8.681-8.061V5.365h-10v3.921L29.182,0L0.502,26.632c-0.404,0.376-0.428,1.009-0.052,1.414\n\tc0.375,0.404,1.008,0.427,1.414,0.052l3.319-3.082v33.349h16h16h16V25.015l3.319,3.082c0.192,0.179,0.437,0.267,0.681,0.267\n\tc0.269,0,0.536-0.107,0.732-0.319C58.291,27.641,58.267,27.008,57.863,26.632z M41.182,7.365h6v9.349l-6-5.571V7.365z\n\t M23.182,56.365V35.302c0-0.517,0.42-0.937,0.937-0.937h10.126c0.517,0,0.937,0.42,0.937,0.937v21.063H23.182z M51.182,56.365h-14\n\tV35.302c0-1.62-1.317-2.937-2.937-2.937H24.119c-1.62,0-2.937,1.317-2.937,2.937v21.063h-14V23.158l22-20.429l14.28,13.26\n\tl5.72,5.311v0l2,1.857V56.365z\"/>\n</svg>";

},{}],28:[function(require,module,exports){
"use strict";

module.exports = "\n<svg version=\"1.1\" id=\"Capa_1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\"\n\t width=\"491.582px\" height=\"491.582px\" viewBox=\"0 0 491.582 491.582\" style=\"enable-background:new 0 0 491.582 491.582;\"\n\t xml:space=\"preserve\">\n<g>\n\t<g>\n\t\t<path d=\"M245.791,0C153.799,0,78.957,74.841,78.957,166.833c0,36.967,21.764,93.187,68.493,176.926\n\t\t\tc31.887,57.138,63.627,105.4,64.966,107.433l22.941,34.773c2.313,3.507,6.232,5.617,10.434,5.617s8.121-2.11,10.434-5.617\n\t\t\tl22.94-34.771c1.326-2.01,32.835-49.855,64.967-107.435c46.729-83.735,68.493-139.955,68.493-176.926\n\t\t\tC412.625,74.841,337.783,0,245.791,0z M322.302,331.576c-31.685,56.775-62.696,103.869-64.003,105.848l-12.508,18.959\n\t\t\tl-12.504-18.954c-1.314-1.995-32.563-49.511-64.007-105.853c-43.345-77.676-65.323-133.104-65.323-164.743\n\t\t\tC103.957,88.626,167.583,25,245.791,25s141.834,63.626,141.834,141.833C387.625,198.476,365.647,253.902,322.302,331.576z\"/>\n\t\t<path d=\"M245.791,73.291c-51.005,0-92.5,41.496-92.5,92.5s41.495,92.5,92.5,92.5s92.5-41.496,92.5-92.5\n\t\t\tS296.796,73.291,245.791,73.291z M245.791,233.291c-37.22,0-67.5-30.28-67.5-67.5s30.28-67.5,67.5-67.5\n\t\t\tc37.221,0,67.5,30.28,67.5,67.5S283.012,233.291,245.791,233.291z\"/>\n\t</g>\n</g>\n</svg>";

},{}],29:[function(require,module,exports){
"use strict";

module.exports = "<svg version=\"1.1\" id=\"Layer_1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\"\n\t viewBox=\"0 0 348.1 348.1\" style=\"enable-background:new 0 0 348.1 348.1;\" xml:space=\"preserve\">\n<g>\n    <path d=\"M260.1,48.65c-22,0-40,18-40,40s18,40,40,40s40-18,40-40S282.1,48.65,260.1,48.65z M260.1,112.65c-13.2,0-24-10.8-24-24\n        s10.8-24,24-24s24,10.8,24,24S273.3,112.65,260.1,112.65z\"/>\n    <path d=\"M308.1,1.05h-108c-10.8,0-20.8,4-28,11.6L11.7,172.25c-15.6,15.6-15.6,40.8,0,56.4l107.2,106.8\n        c7.6,7.6,17.6,11.6,28.4,11.6s20.8-4,28.4-11.6l160.4-160.4c7.6-7.2,12-17.2,12-27.6V41.05C348.1,19.05,330.1,1.05,308.1,1.05z\n         M332.1,147.45c0,6-2.4,12-7.2,16l-160.8,160.8c-4.4,4.4-10.4,6.8-16.8,6.8s-12.4-2.4-16.8-6.8L22.9,217.45\n        c-9.2-9.2-9.2-24.4,0-34l160.4-159.6c4.4-4.4,10.4-6.8,16.8-6.8h108c13.2,0,24,10.8,24,24V147.45z\"/>\n</g>\n</svg>";

},{}],30:[function(require,module,exports){
"use strict";

module.exports = "<svg version=\"1.1\" id=\"Capa_1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\"\n\t viewBox=\"0 0 54.908 54.908\" style=\"enable-background:new 0 0 54.908 54.908;\" xml:space=\"preserve\">\n<g>\n\t<path d=\"M54.615,19.123c-7.243-7.244-16.89-11.233-27.161-11.233S7.537,11.878,0.293,19.123c-0.391,0.391-0.391,1.023,0,1.414\n\t\ts1.023,0.391,1.414,0C8.573,13.67,17.717,9.889,27.454,9.889s18.881,3.781,25.747,10.647c0.195,0.195,0.451,0.293,0.707,0.293\n\t\ts0.512-0.098,0.707-0.293C55.006,20.146,55.006,19.513,54.615,19.123z\"/>\n\t<path d=\"M6.171,25c-0.391,0.391-0.391,1.023,0,1.414c0.195,0.195,0.451,0.293,0.707,0.293s0.512-0.098,0.707-0.293\n\t\tc10.955-10.956,28.781-10.956,39.737,0c0.391,0.391,1.023,0.391,1.414,0s0.391-1.023,0-1.414C37.002,13.266,17.907,13.264,6.171,25\n\t\tz\"/>\n\t<path d=\"M27.454,24.508c-5.825,0-11.295,2.263-15.404,6.371c-0.391,0.391-0.391,1.023,0,1.414s1.023,0.391,1.414,0\n\t\tc3.731-3.73,8.699-5.785,13.99-5.785c5.291,0,10.259,2.055,13.99,5.785c0.195,0.195,0.451,0.293,0.707,0.293\n\t\ts0.512-0.098,0.707-0.293c0.391-0.391,0.391-1.023,0-1.414C38.75,26.771,33.279,24.508,27.454,24.508z\"/>\n\t<path d=\"M27.454,33.916c-3.612,0-6.551,2.939-6.551,6.552s2.939,6.552,6.551,6.552c3.613,0,6.552-2.939,6.552-6.552\n\t\tS31.067,33.916,27.454,33.916z M27.454,45.019c-2.51,0-4.551-2.042-4.551-4.552s2.042-4.552,4.551-4.552s4.552,2.042,4.552,4.552\n\t\tS29.964,45.019,27.454,45.019z\"/>\n</g>\n</svg>";

},{}],31:[function(require,module,exports){
"use strict";

module.exports = function (err) {
  console.log(err.stack || err);
};

},{}],32:[function(require,module,exports){
'use strict';

module.exports = {

    Error: require('./MyError'),

    P: function P(fun) {
        var args = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
        var thisArg = arguments[2];
        return new Promise(function (resolve, reject) {
            return Reflect.apply(fun, thisArg || undefined, args.concat(function (e) {
                for (var _len = arguments.length, callback = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                    callback[_key - 1] = arguments[_key];
                }

                return e ? reject(e) : resolve(callback);
            }));
        });
    },

    constructor: function constructor() {
        return this;
    }
};

},{"./MyError":31}],33:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        // At least give some kind of context to the user
        var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
        err.context = er;
        throw err;
      }
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    args = Array.prototype.slice.call(arguments, 1);
    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else if (listeners) {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.prototype.listenerCount = function(type) {
  if (this._events) {
    var evlistener = this._events[type];

    if (isFunction(evlistener))
      return 1;
    else if (evlistener)
      return evlistener.length;
  }
  return 0;
};

EventEmitter.listenerCount = function(emitter, type) {
  return emitter.listenerCount(type);
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}]},{},[5])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjbGllbnQvanMvLlRlbXBsYXRlTWFwLmpzIiwiY2xpZW50L2pzLy5WaWV3TWFwLmpzIiwiY2xpZW50L2pzL1hoci5qcyIsImNsaWVudC9qcy9mYWN0b3J5L1ZpZXcuanMiLCJjbGllbnQvanMvbWFpbi5qcyIsImNsaWVudC9qcy9wb2x5ZmlsbC5qcyIsImNsaWVudC9qcy9yb3V0ZXIuanMiLCJjbGllbnQvanMvdmlld3MvRXZlbnRzLmpzIiwiY2xpZW50L2pzL3ZpZXdzL0ZpcmVob3NlLmpzIiwiY2xpZW50L2pzL3ZpZXdzL0dlby5qcyIsImNsaWVudC9qcy92aWV3cy9IZWFkZXIuanMiLCJjbGllbnQvanMvdmlld3MvSG9tZS5qcyIsImNsaWVudC9qcy92aWV3cy9PdmVydmlldy5qcyIsImNsaWVudC9qcy92aWV3cy9TaWRlYmFyLmpzIiwiY2xpZW50L2pzL3ZpZXdzL1dpZGdldC5qcyIsImNsaWVudC9qcy92aWV3cy9fX3Byb3RvX18uanMiLCJjbGllbnQvanMvdmlld3MvbGliL09wdGltaXplZFJlc2l6ZS5qcyIsImNsaWVudC9qcy92aWV3cy90ZW1wbGF0ZXMvRXZlbnRzLmpzIiwiY2xpZW50L2pzL3ZpZXdzL3RlbXBsYXRlcy9GaXJlaG9zZS5qcyIsImNsaWVudC9qcy92aWV3cy90ZW1wbGF0ZXMvR2VvLmpzIiwiY2xpZW50L2pzL3ZpZXdzL3RlbXBsYXRlcy9IZWFkZXIuanMiLCJjbGllbnQvanMvdmlld3MvdGVtcGxhdGVzL0hvbWUuanMiLCJjbGllbnQvanMvdmlld3MvdGVtcGxhdGVzL092ZXJ2aWV3LmpzIiwiY2xpZW50L2pzL3ZpZXdzL3RlbXBsYXRlcy9TaWRlYmFyLmpzIiwiY2xpZW50L2pzL3ZpZXdzL3RlbXBsYXRlcy9XaWRnZXQuanMiLCJjbGllbnQvanMvdmlld3MvdGVtcGxhdGVzL2xpYi9kb2xsYXIuanMiLCJjbGllbnQvanMvdmlld3MvdGVtcGxhdGVzL2xpYi9ob21lLmpzIiwiY2xpZW50L2pzL3ZpZXdzL3RlbXBsYXRlcy9saWIvbG9jYXRpb24uanMiLCJjbGllbnQvanMvdmlld3MvdGVtcGxhdGVzL2xpYi90YWcuanMiLCJjbGllbnQvanMvdmlld3MvdGVtcGxhdGVzL2xpYi93aWZpLmpzIiwibGliL015RXJyb3IuanMiLCJsaWIvTXlPYmplY3QuanMiLCJub2RlX21vZHVsZXMvZXZlbnRzL2V2ZW50cy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsT0FBTyxPQUFQLEdBQWU7QUFDZCxTQUFRLFFBQVEsMEJBQVIsQ0FETTtBQUVkLFdBQVUsUUFBUSw0QkFBUixDQUZJO0FBR2QsTUFBSyxRQUFRLHVCQUFSLENBSFM7QUFJZCxTQUFRLFFBQVEsMEJBQVIsQ0FKTTtBQUtkLE9BQU0sUUFBUSx3QkFBUixDQUxRO0FBTWQsV0FBVSxRQUFRLDRCQUFSLENBTkk7QUFPZCxVQUFTLFFBQVEsMkJBQVIsQ0FQSztBQVFkLFNBQVEsUUFBUSwwQkFBUjtBQVJNLENBQWY7Ozs7O0FDQUEsT0FBTyxPQUFQLEdBQWU7QUFDZCxTQUFRLFFBQVEsZ0JBQVIsQ0FETTtBQUVkLFdBQVUsUUFBUSxrQkFBUixDQUZJO0FBR2QsTUFBSyxRQUFRLGFBQVIsQ0FIUztBQUlkLFNBQVEsUUFBUSxnQkFBUixDQUpNO0FBS2QsT0FBTSxRQUFRLGNBQVIsQ0FMUTtBQU1kLFdBQVUsUUFBUSxrQkFBUixDQU5JO0FBT2QsVUFBUyxRQUFRLGlCQUFSLENBUEs7QUFRZCxTQUFRLFFBQVEsZ0JBQVI7QUFSTSxDQUFmOzs7OztBQ0FBLE9BQU8sT0FBUCxHQUFpQixPQUFPLE1BQVAsQ0FBZSxPQUFPLE1BQVAsQ0FBZSxFQUFmLEVBQW1CLFFBQVEsb0JBQVIsQ0FBbkIsRUFBa0Q7O0FBRTlFLGFBQVM7QUFFTCxtQkFGSyx1QkFFUSxJQUZSLEVBRWU7QUFBQTs7QUFDaEIsZ0JBQUksTUFBTSxJQUFJLGNBQUosRUFBVjs7QUFFQSxtQkFBTyxJQUFJLE9BQUosQ0FBYSxVQUFFLE9B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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJtb2R1bGUuZXhwb3J0cz17XG5cdEV2ZW50czogcmVxdWlyZSgnLi92aWV3cy90ZW1wbGF0ZXMvRXZlbnRzJyksXG5cdEZpcmVob3NlOiByZXF1aXJlKCcuL3ZpZXdzL3RlbXBsYXRlcy9GaXJlaG9zZScpLFxuXHRHZW86IHJlcXVpcmUoJy4vdmlld3MvdGVtcGxhdGVzL0dlbycpLFxuXHRIZWFkZXI6IHJlcXVpcmUoJy4vdmlld3MvdGVtcGxhdGVzL0hlYWRlcicpLFxuXHRIb21lOiByZXF1aXJlKCcuL3ZpZXdzL3RlbXBsYXRlcy9Ib21lJyksXG5cdE92ZXJ2aWV3OiByZXF1aXJlKCcuL3ZpZXdzL3RlbXBsYXRlcy9PdmVydmlldycpLFxuXHRTaWRlYmFyOiByZXF1aXJlKCcuL3ZpZXdzL3RlbXBsYXRlcy9TaWRlYmFyJyksXG5cdFdpZGdldDogcmVxdWlyZSgnLi92aWV3cy90ZW1wbGF0ZXMvV2lkZ2V0Jylcbn0iLCJtb2R1bGUuZXhwb3J0cz17XG5cdEV2ZW50czogcmVxdWlyZSgnLi92aWV3cy9FdmVudHMnKSxcblx0RmlyZWhvc2U6IHJlcXVpcmUoJy4vdmlld3MvRmlyZWhvc2UnKSxcblx0R2VvOiByZXF1aXJlKCcuL3ZpZXdzL0dlbycpLFxuXHRIZWFkZXI6IHJlcXVpcmUoJy4vdmlld3MvSGVhZGVyJyksXG5cdEhvbWU6IHJlcXVpcmUoJy4vdmlld3MvSG9tZScpLFxuXHRPdmVydmlldzogcmVxdWlyZSgnLi92aWV3cy9PdmVydmlldycpLFxuXHRTaWRlYmFyOiByZXF1aXJlKCcuL3ZpZXdzL1NpZGViYXInKSxcblx0V2lkZ2V0OiByZXF1aXJlKCcuL3ZpZXdzL1dpZGdldCcpXG59IiwibW9kdWxlLmV4cG9ydHMgPSBPYmplY3QuY3JlYXRlKCBPYmplY3QuYXNzaWduKCB7fSwgcmVxdWlyZSgnLi4vLi4vbGliL015T2JqZWN0JyksIHtcblxuICAgIFJlcXVlc3Q6IHtcblxuICAgICAgICBjb25zdHJ1Y3RvciggZGF0YSApIHtcbiAgICAgICAgICAgIGxldCByZXEgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKVxuXG4gICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoICggcmVzb2x2ZSwgcmVqZWN0ICkgPT4ge1xuXG4gICAgICAgICAgICAgICAgcmVxLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBbIDUwMCwgNDA0LCA0MDEgXS5pbmNsdWRlcyggdGhpcy5zdGF0dXMgKVxuICAgICAgICAgICAgICAgICAgICAgICAgPyByZWplY3QoIHRoaXMucmVzcG9uc2UgKVxuICAgICAgICAgICAgICAgICAgICAgICAgOiByZXNvbHZlKCBKU09OLnBhcnNlKHRoaXMucmVzcG9uc2UpIClcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiggZGF0YS5tZXRob2QgPT09IFwiZ2V0XCIgfHwgZGF0YS5tZXRob2QgPT09IFwib3B0aW9uc1wiICkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgcXMgPSBkYXRhLnFzID8gYD8ke2RhdGEucXN9YCA6ICcnIFxuICAgICAgICAgICAgICAgICAgICByZXEub3BlbiggZGF0YS5tZXRob2QsIGAvJHtkYXRhLnJlc291cmNlfSR7cXN9YCApXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0SGVhZGVycyggcmVxLCBkYXRhLmhlYWRlcnMgKVxuICAgICAgICAgICAgICAgICAgICByZXEuc2VuZChudWxsKVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJlcS5vcGVuKCBkYXRhLm1ldGhvZCwgYC8ke2RhdGEucmVzb3VyY2V9YCwgdHJ1ZSlcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRIZWFkZXJzKCByZXEsIGRhdGEuaGVhZGVycyApXG4gICAgICAgICAgICAgICAgICAgIHJlcS5zZW5kKCBkYXRhLmRhdGEgKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gKVxuICAgICAgICB9LFxuXG4gICAgICAgIHBsYWluRXNjYXBlKCBzVGV4dCApIHtcbiAgICAgICAgICAgIC8qIGhvdyBzaG91bGQgSSB0cmVhdCBhIHRleHQvcGxhaW4gZm9ybSBlbmNvZGluZz8gd2hhdCBjaGFyYWN0ZXJzIGFyZSBub3QgYWxsb3dlZD8gdGhpcyBpcyB3aGF0IEkgc3VwcG9zZS4uLjogKi9cbiAgICAgICAgICAgIC8qIFwiNFxcM1xcNyAtIEVpbnN0ZWluIHNhaWQgRT1tYzJcIiAtLS0tPiBcIjRcXFxcM1xcXFw3XFwgLVxcIEVpbnN0ZWluXFwgc2FpZFxcIEVcXD1tYzJcIiAqL1xuICAgICAgICAgICAgcmV0dXJuIHNUZXh0LnJlcGxhY2UoL1tcXHNcXD1cXFxcXS9nLCBcIlxcXFwkJlwiKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzZXRIZWFkZXJzKCByZXEsIGhlYWRlcnM9e30gKSB7XG4gICAgICAgICAgICByZXEuc2V0UmVxdWVzdEhlYWRlciggXCJBY2NlcHRcIiwgaGVhZGVycy5hY2NlcHQgfHwgJ2FwcGxpY2F0aW9uL2pzb24nIClcbiAgICAgICAgICAgIHJlcS5zZXRSZXF1ZXN0SGVhZGVyKCBcIkNvbnRlbnQtVHlwZVwiLCBoZWFkZXJzLmNvbnRlbnRUeXBlIHx8ICd0ZXh0L3BsYWluJyApXG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgX2ZhY3RvcnkoIGRhdGEgKSB7XG4gICAgICAgIHJldHVybiBPYmplY3QuY3JlYXRlKCB0aGlzLlJlcXVlc3QsIHsgfSApLmNvbnN0cnVjdG9yKCBkYXRhIClcbiAgICB9LFxuXG4gICAgY29uc3RydWN0b3IoKSB7XG5cbiAgICAgICAgaWYoICFYTUxIdHRwUmVxdWVzdC5wcm90b3R5cGUuc2VuZEFzQmluYXJ5ICkge1xuICAgICAgICAgIFhNTEh0dHBSZXF1ZXN0LnByb3RvdHlwZS5zZW5kQXNCaW5hcnkgPSBmdW5jdGlvbihzRGF0YSkge1xuICAgICAgICAgICAgdmFyIG5CeXRlcyA9IHNEYXRhLmxlbmd0aCwgdWk4RGF0YSA9IG5ldyBVaW50OEFycmF5KG5CeXRlcyk7XG4gICAgICAgICAgICBmb3IgKHZhciBuSWR4ID0gMDsgbklkeCA8IG5CeXRlczsgbklkeCsrKSB7XG4gICAgICAgICAgICAgIHVpOERhdGFbbklkeF0gPSBzRGF0YS5jaGFyQ29kZUF0KG5JZHgpICYgMHhmZjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuc2VuZCh1aThEYXRhKTtcbiAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX2ZhY3RvcnkuYmluZCh0aGlzKVxuICAgIH1cblxufSApLCB7IH0gKS5jb25zdHJ1Y3RvcigpXG4iLCJtb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5jcmVhdGUoIHtcblxuICAgIGNyZWF0ZSggbmFtZSwgb3B0cyApIHtcbiAgICAgICAgY29uc3QgbG93ZXIgPSBuYW1lXG4gICAgICAgIG5hbWUgPSBuYW1lLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgbmFtZS5zbGljZSgxKVxuICAgICAgICByZXR1cm4gT2JqZWN0LmNyZWF0ZShcbiAgICAgICAgICAgIHRoaXMuVmlld3NbIG5hbWUgXSxcbiAgICAgICAgICAgIE9iamVjdC5hc3NpZ24oIHtcbiAgICAgICAgICAgICAgICBuYW1lOiB7IHZhbHVlOiBuYW1lIH0sXG4gICAgICAgICAgICAgICAgZmFjdG9yeTogeyB2YWx1ZTogdGhpcyB9LFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlOiB7IHZhbHVlOiB0aGlzLlRlbXBsYXRlc1sgbmFtZSBdIH0sXG4gICAgICAgICAgICAgICAgdXNlcjogeyB2YWx1ZTogdGhpcy5Vc2VyIH0sXG4gICAgICAgICAgICAgICAgVmlld3M6IHsgdmFsdWU6IHsgfSB9XG4gICAgICAgICAgICAgICAgfSwgb3B0cyApXG4gICAgICAgICkuY29uc3RydWN0b3IoKVxuICAgICAgICAub24oICduYXZpZ2F0ZScsIHJvdXRlID0+IHJlcXVpcmUoJy4uL3JvdXRlcicpLm5hdmlnYXRlKCByb3V0ZSApIClcbiAgICAgICAgLm9uKCAnZGVsZXRlZCcsICgpID0+IGRlbGV0ZSAocmVxdWlyZSgnLi4vcm91dGVyJykpLnZpZXdzW2xvd2VyXSApXG4gICAgfSxcblxufSwge1xuICAgIFRlbXBsYXRlczogeyB2YWx1ZTogcmVxdWlyZSgnLi4vLlRlbXBsYXRlTWFwJykgfSxcbiAgICBWaWV3czogeyB2YWx1ZTogcmVxdWlyZSgnLi4vLlZpZXdNYXAnKSB9XG59IClcbiIsInJlcXVpcmUoJy4vcG9seWZpbGwnKVxud2luZG93LmluaXRNYXAgPSAoKSA9PiB0cnVlXG53aW5kb3cub25sb2FkID0gKCkgPT4gcmVxdWlyZSgnLi9yb3V0ZXInKVxuIiwiLy9odHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvRWxlbWVudC9jbG9zZXN0XG5pZiAod2luZG93LkVsZW1lbnQgJiYgIUVsZW1lbnQucHJvdG90eXBlLmNsb3Nlc3QpIHtcbiAgICBFbGVtZW50LnByb3RvdHlwZS5jbG9zZXN0ID0gXG4gICAgZnVuY3Rpb24ocykge1xuICAgICAgICB2YXIgbWF0Y2hlcyA9ICh0aGlzLmRvY3VtZW50IHx8IHRoaXMub3duZXJEb2N1bWVudCkucXVlcnlTZWxlY3RvckFsbChzKSxcbiAgICAgICAgICAgIGksXG4gICAgICAgICAgICBlbCA9IHRoaXM7XG4gICAgICAgIGRvIHtcbiAgICAgICAgICAgIGkgPSBtYXRjaGVzLmxlbmd0aDtcbiAgICAgICAgICAgIHdoaWxlICgtLWkgPj0gMCAmJiBtYXRjaGVzLml0ZW0oaSkgIT09IGVsKSB7fTtcbiAgICAgICAgfSB3aGlsZSAoKGkgPCAwKSAmJiAoZWwgPSBlbC5wYXJlbnRFbGVtZW50KSk7IFxuICAgICAgICByZXR1cm4gZWw7XG4gICAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB0cnVlXG4iLCJtb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5jcmVhdGUoIHtcblxuICAgIEVycm9yOiByZXF1aXJlKCcuLi8uLi9saWIvTXlFcnJvcicpLFxuICAgIFxuICAgIFZpZXdGYWN0b3J5OiByZXF1aXJlKCcuL2ZhY3RvcnkvVmlldycpLFxuICAgIFxuICAgIFZpZXdzOiByZXF1aXJlKCcuLy5WaWV3TWFwJyksXG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5jb250ZW50Q29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2NvbnRlbnQnKVxuXG4gICAgICAgIHdpbmRvdy5vbnBvcHN0YXRlID0gdGhpcy5oYW5kbGUuYmluZCh0aGlzKVxuXG4gICAgICAgIHRoaXMuaGFuZGxlKClcblxuICAgICAgICByZXR1cm4gdGhpc1xuICAgIH0sXG5cbiAgICBoYW5kbGUoKSB7XG4gICAgICAgIHRoaXMuaGFuZGxlciggd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLnNwbGl0KCcvJykuc2xpY2UoMSkgKVxuICAgIH0sXG5cbiAgICBoYW5kbGVyKCBwYXRoICkge1xuICAgICAgICBjb25zdCB2aWV3ID0gdGhpcy5WaWV3c1sgcGF0aFswXSBdID8gcGF0aFswXSA6ICdob21lJztcblxuICAgICAgICAoICggdmlldyA9PT0gdGhpcy5jdXJyZW50VmlldyApXG4gICAgICAgICAgICA/IFByb21pc2UucmVzb2x2ZSgpXG4gICAgICAgICAgICA6IFByb21pc2UuYWxsKCBPYmplY3Qua2V5cyggdGhpcy52aWV3cyApLm1hcCggdmlldyA9PiB0aGlzLnZpZXdzWyB2aWV3IF0uaGlkZSgpICkgKSApIFxuICAgICAgICAudGhlbiggKCkgPT4ge1xuXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRWaWV3ID0gdmlld1xuXG4gICAgICAgICAgICBpZiggdGhpcy52aWV3c1sgdmlldyBdICkgcmV0dXJuIHRoaXMudmlld3NbIHZpZXcgXS5vbk5hdmlnYXRpb24oIHBhdGggKVxuXG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKFxuICAgICAgICAgICAgICAgIHRoaXMudmlld3NbIHZpZXcgXSA9XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuVmlld0ZhY3RvcnkuY3JlYXRlKCB2aWV3LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbnNlcnRpb246IHsgdmFsdWU6IHsgZWw6IHRoaXMuY29udGVudENvbnRhaW5lciB9IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXRoOiB7IHZhbHVlOiBwYXRoLCB3cml0YWJsZTogdHJ1ZSB9XG4gICAgICAgICAgICAgICAgICAgIH0gKVxuICAgICAgICAgICAgKVxuICAgICAgICB9IClcbiAgICAgICAgLmNhdGNoKCB0aGlzLkVycm9yIClcbiAgICB9LFxuXG4gICAgbmF2aWdhdGUoIGxvY2F0aW9uICkge1xuICAgICAgICBoaXN0b3J5LnB1c2hTdGF0ZSgge30sICcnLCBsb2NhdGlvbiApXG4gICAgICAgIHRoaXMuaGFuZGxlKClcbiAgICB9XG5cbn0sIHsgY3VycmVudFZpZXc6IHsgdmFsdWU6ICcnLCB3cml0YWJsZTogdHJ1ZSB9LCB2aWV3czogeyB2YWx1ZTogeyB9IH0gfSApLmNvbnN0cnVjdG9yKClcbiIsIm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmFzc2lnbigge30sIHJlcXVpcmUoJy4vX19wcm90b19fJyksIHtcbn0gKVxuIiwibW9kdWxlLmV4cG9ydHMgPSBPYmplY3QuYXNzaWduKCB7fSwgcmVxdWlyZSgnLi9fX3Byb3RvX18nKSwge1xuXG4gICAgIC8vVGhpcyBjaGFuZ2VzIHRoZSBzaXplIG9mIHRoZSBjb21wb25lbnQgYnkgYWRqdXN0aW5nIHRoZSByYWRpdXMgYW5kIHdpZHRoL2hlaWdodDtcbiAgICBjaGFuZ2VTaXplKCB3LCBoICkge1xuICAgICAgICB0aGlzLnZpel9jb250YWluZXIudHJhbnNpdGlvbigpLmR1cmF0aW9uKDMwMCkuc3R5bGUoJ3dpZHRoJywgdyArICdweCcpLnN0eWxlKCdoZWlnaHQnLCBoICsgJ3B4Jyk7XG4gICAgICAgIHRoaXMudml6LndpZHRoKHcpLmhlaWdodChoKi44KS51cGRhdGUoKTtcbiAgICB9LFxuXG4gICAgLy9UaGlzIHNldHMgdGhlIHNhbWUgdmFsdWUgZm9yIGVhY2ggcmFkaWFsIHByb2dyZXNzXG4gICAgY2hhbmdlRGF0YSggdmFsICkge1xuICAgICAgICB0aGlzLnZhbHVlRmllbGQgPSB0aGlzLnZhbHVlRmllbGRzWyBOdW1iZXIodmFsKSBdO1xuICAgICAgICB0aGlzLnZpei51cGRhdGUoKTtcbiAgICB9LFxuXG4gICAgLy9UaGlzIGZ1bmN0aW9uIGlzIGNhbGxlZCB3aGVuIHRoZSB1c2VyIHNlbGVjdHMgYSBkaWZmZXJlbnQgc2tpbi5cbiAgICBjaGFuZ2VTa2luKCB2YWwgKSB7XG4gICAgICAgIGlmICh2YWwgPT0gXCJOb25lXCIpIHtcbiAgICAgICAgICAgIHRoaXMudGhlbWUucmVsZWFzZSgpXG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnRoZW1lLnZpeih2aXopXG4gICAgICAgICAgICB0aGlzLnRoZW1lLnNraW4odmFsKVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy52aXooKS51cGRhdGUoKTsgIC8vV2UgY291bGQgdXNlIHRoZW1lLmFwcGx5KCkgaGVyZSwgYnV0IHdlIHdhbnQgdG8gdHJpZ2dlciB0aGUgdHdlZW4uXG4gICAgfSxcblxuICAgIC8vIFRoaXMgZnVuY3Rpb24gdXNlcyB0aGUgYWJvdmUgaHRtbCB0ZW1wbGF0ZSB0byByZXBsYWNlIHZhbHVlcyBhbmQgdGhlbiBjcmVhdGVzIGEgbmV3IDxkaXY+IHRoYXQgaXQgYXBwZW5kcyB0byB0aGVcbiAgICAvLyBkb2N1bWVudC5ib2R5LiAgVGhpcyBpcyBqdXN0IG9uZSB3YXkgeW91IGNvdWxkIGltcGxlbWVudCBhIGRhdGEgdGlwLlxuICAgIGNyZWF0ZURhdGFUaXAoIHgseSxoMSxoMixoMyApIHtcblxuICAgICAgICB2YXIgaHRtbCA9IHRoaXMuZGF0YXRpcC5yZXBsYWNlKFwiSEVBREVSMVwiLCBoMSk7XG4gICAgICAgIGh0bWwgPSBodG1sLnJlcGxhY2UoXCJIRUFERVIyXCIsIGgyKTtcbiAgICAgICAgaHRtbCA9IGh0bWwucmVwbGFjZShcIkhFQURFUjNcIiwgaDMpO1xuXG4gICAgICAgIGQzLnNlbGVjdChcImJvZHlcIilcbiAgICAgICAgICAgIC5hcHBlbmQoXCJkaXZcIilcbiAgICAgICAgICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJ2ei13ZWlnaHRlZF90cmVlLXRpcFwiKVxuICAgICAgICAgICAgLnN0eWxlKFwicG9zaXRpb25cIiwgXCJhYnNvbHV0ZVwiKVxuICAgICAgICAgICAgLnN0eWxlKFwidG9wXCIsIHkgKyBcInB4XCIpXG4gICAgICAgICAgICAuc3R5bGUoXCJsZWZ0XCIsICh4IC0gMTI1KSArIFwicHhcIilcbiAgICAgICAgICAgIC5zdHlsZShcIm9wYWNpdHlcIiwwKVxuICAgICAgICAgICAgLmh0bWwoaHRtbClcbiAgICAgICAgICAgIC50cmFuc2l0aW9uKCkuc3R5bGUoXCJvcGFjaXR5XCIsMSk7XG4gICAgfSxcblxuICAgIGRhdGF0aXA6IGA8ZGl2IGNsYXNzPVwidG9vbHRpcFwiIHN0eWxlPVwid2lkdGg6IDI1MHB4OyBiYWNrZ3JvdW5kLW9wYWNpdHk6LjVcIj5gICtcbiAgICAgICAgICAgICBgPGRpdiBjbGFzcz1cImhlYWRlcjFcIj5IRUFERVIxPC9kaXY+YCArXG4gICAgICAgICAgICAgYDxkaXYgY2xhc3M9XCJoZWFkZXItcnVsZVwiPjwvZGl2PmAgK1xuICAgICAgICAgICAgIGA8ZGl2IGNsYXNzPVwiaGVhZGVyMlwiPiBIRUFERVIyIDwvZGl2PmAgK1xuICAgICAgICAgICAgIGA8ZGl2IGNsYXNzPVwiaGVhZGVyLXJ1bGVcIj48L2Rpdj5gICtcbiAgICAgICAgICAgICBgPGRpdiBjbGFzcz1cImhlYWRlcjNcIj4gSEVBREVSMyA8L2Rpdj5gICtcbiAgICAgICAgICAgICBgPC9kaXY+YCxcblxuICAgIGZvcm1hdEN1cnJlbmN5KGQpIHtcbiAgICAgICAgaWYgKGlzTmFOKGQpKSBkID0gMDsgcmV0dXJuIFwiJFwiICsgZDMuZm9ybWF0KFwiLC4yZlwiKShkKSArIFwiIEJpbGxpb25cIjtcbiAgICAgfSxcblxuICAgIGluaXRpYWxpemUoKSB7XG4gICAgICAgIHRoaXMudml6ID0gdml6dWx5LnZpei53ZWlnaHRlZF90cmVlKCB0aGlzLmVscy5jb250YWluZXIgKVxuXG4gICAgICAgIC8vSGVyZSB3ZSBjcmVhdGUgdGhyZWUgdml6dWx5IHRoZW1lcyBmb3IgZWFjaCByYWRpYWwgcHJvZ3Jlc3MgY29tcG9uZW50LlxuICAgICAgICAvL0EgdGhlbWUgbWFuYWdlcyB0aGUgbG9vayBhbmQgZmVlbCBvZiB0aGUgY29tcG9uZW50IG91dHB1dC4gIFlvdSBjYW4gb25seSBoYXZlXG4gICAgICAgIC8vb25lIGNvbXBvbmVudCBhY3RpdmUgcGVyIHRoZW1lLCBzbyB3ZSBiaW5kIGVhY2ggdGhlbWUgdG8gdGhlIGNvcnJlc3BvbmRpbmcgY29tcG9uZW50LlxuICAgICAgICB0aGlzLnRoZW1lID1cbiAgICAgICAgICAgIHZpenVseS50aGVtZS53ZWlnaHRlZF90cmVlKCB0aGlzLnZpeilcbiAgICAgICAgICAgICAgICAgICAgICAgIC5za2luKHZpenVseS5za2luLldFSUdIVEVEX1RSRUVfQVhJSVMpXG5cbiAgICAgICAgLy9MaWtlIEQzIGFuZCBqUXVlcnksIHZpenVseSB1c2VzIGEgZnVuY3Rpb24gY2hhaW5pbmcgc3ludGF4IHRvIHNldCBjb21wb25lbnQgcHJvcGVydGllc1xuICAgICAgICAvL0hlcmUgd2Ugc2V0IHNvbWUgYmFzZXMgbGluZSBwcm9wZXJ0aWVzIGZvciBhbGwgdGhyZWUgY29tcG9uZW50cy5cbiAgICAgICAgdGhpcy52aXouZGF0YSh0aGlzLmRhdGEpXG4gICAgICAgICAgICAgICAgLndpZHRoKHRoaXMuZWxzLmNvbnRhaW5lci5jbGllbnRXaWR0aCkgXG4gICAgICAgICAgICAgICAgLmhlaWdodCh0aGlzLmVscy5jb250YWluZXIuY2xpZW50SGVpZ2h0KVxuICAgICAgICAgICAgICAgIC5jaGlsZHJlbiggZCA9PiBkLnZhbHVlcyApXG4gICAgICAgICAgICAgICAgLmtleSggZCA9PiBkLmlkIClcbiAgICAgICAgICAgICAgICAudmFsdWUoIGQgPT4gTnVtYmVyKCBkWyBgYWdnXyR7dGhpcy52YWx1ZUZpZWxkfWAgXSApIClcbiAgICAgICAgICAgICAgICAuZml4ZWRTcGFuKC0xKVxuICAgICAgICAgICAgICAgIC5sYWJlbCggZCA9PiB0aGlzLnRyaW1MYWJlbCggZC5rZXkgfHwgKGRbIGBMZXZlbCR7ZC5kZXB0aH1gIF0gKSApIClcbiAgICAgICAgICAgICAgICAub24oIFwibWVhc3VyZVwiLCB0aGlzLm9uTWVhc3VyZS5iaW5kKHRoaXMpIClcbiAgICAgICAgICAgICAgICAub24oIFwibW91c2VvdmVyXCIsIHRoaXMub25Nb3VzZU92ZXIuYmluZCh0aGlzKSApXG4gICAgICAgICAgICAgICAgLm9uKCBcIm1vdXNlb3V0XCIsIHRoaXMub25Nb3VzZU91dC5iaW5kKHRoaXMpIClcbiAgICAgICAgICAgICAgICAub24oIFwiY2xpY2tcIiwgdGhpcy5vbkNsaWNrLmJpbmQodGhpcykgKVxuXG4gICAgICAgIC8vV2UgdXNlIHRoaXMgZnVuY3Rpb24gdG8gc2l6ZSB0aGUgY29tcG9uZW50cyBiYXNlZCBvbiB0aGUgc2VsZWN0ZWQgdmFsdWUgZnJvbSB0aGUgUmFkaWFMUHJvZ3Jlc3NUZXN0Lmh0bWwgcGFnZS5cbiAgICAgICAgdGhpcy5jaGFuZ2VTaXplKCB0aGlzLmVscy5jb250YWluZXIuY2xpZW50V2lkdGgsIHRoaXMuZWxzLmNvbnRhaW5lci5jbGllbnRIZWlnaHQgKVxuICAgICAgICB0aGlzLmluaXRpYWxpemVkID0gdHJ1ZVxuXG4gICAgICAgIC8vIE9wZW4gdXAgc29tZSBvZiB0aGUgdHJlZSBicmFuY2hlcy5cbiAgICAgICAgdGhpcy52aXoudG9nZ2xlTm9kZSh0aGlzLmRhdGEudmFsdWVzWzJdKTtcbiAgICAgICAgdGhpcy52aXoudG9nZ2xlTm9kZSh0aGlzLmRhdGEudmFsdWVzWzJdLnZhbHVlc1swXSk7XG4gICAgICAgIHRoaXMudml6LnRvZ2dsZU5vZGUodGhpcy5kYXRhLnZhbHVlc1szXSk7XG4gICAgfSxcblxuICAgIGxvYWREYXRhKCkge1xuICAgICAgICBkMy5jc3YoXCIvc3RhdGljL2RhdGEvd2VpZ2h0ZWR0cmVlX2ZlZGVyYWxfYnVkZ2V0LmNzdlwiLCBjc3YgPT4ge1xuICAgICAgICAgICAgdGhpcy5kYXRhLnZhbHVlcyA9IHRoaXMucHJlcERhdGEoIGNzdiApXG4gICAgICAgICAgICB0aGlzLmluaXRpYWxpemUoKVxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgb25NZWFzdXJlKCkge1xuICAgICAgIC8vIEFsbG93cyB5b3UgdG8gbWFudWFsbHkgb3ZlcnJpZGUgdmVydGljYWwgc3BhY2luZ1xuICAgICAgIC8vIHZpei50cmVlKCkubm9kZVNpemUoWzEwMCwwXSk7XG4gICAgfSxcblxuICAgIG9uTW91c2VPdmVyKGUsZCxpKSB7XG4gICAgICAgIGlmIChkID09IHRoaXMuZGF0YSkgcmV0dXJuO1xuICAgICAgICB2YXIgcmVjdCA9IGUuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIGlmIChkLnRhcmdldCkgZCA9IGQudGFyZ2V0OyAvL1RoaXMgaWYgZm9yIGxpbmsgZWxlbWVudHNcbiAgICAgICAgdGhpcy5jcmVhdGVEYXRhVGlwKHJlY3QubGVmdCwgcmVjdC50b3AsIChkLmtleSB8fCAoZFsnTGV2ZWwnICsgZC5kZXB0aF0pKSwgdGhpcy5mb3JtYXRDdXJyZW5jeShkW1wiYWdnX1wiICsgdGhpcy52YWx1ZUZpZWxkXSksIHRoaXMudmFsdWVGaWVsZCk7XG4gICAgfSxcblxuICAgICBvbk1vdXNlT3V0KGUsZCxpKSB7XG4gICAgICAgIGQzLnNlbGVjdEFsbChcIi52ei13ZWlnaHRlZF90cmVlLXRpcFwiKS5yZW1vdmUoKTtcbiAgICB9LFxuXG4gICAvL1dlIGNhbiBjYXB0dXJlIGNsaWNrIGV2ZW50cyBhbmQgcmVzcG9uZCB0byB0aGVtXG4gICAgb25DbGljayhlLGQsaSkge1xuICAgICAgICB2aXoudG9nZ2xlTm9kZShkKTtcbiAgICB9LFxuXG4gICAgcG9zdFJlbmRlcigpIHtcbiAgICAgICAgLy8gaHRtbCBlbGVtZW50IHRoYXQgaG9sZHMgdGhlIGNoYXJ0XG4gICAgICAgIHRoaXMudml6X2NvbnRhaW5lciA9IHVuZGVmaW5lZFxuXG4gICAgICAgIC8vIG91ciB3ZWlnaHRlZCB0cmVlXG4gICAgICAgIHRoaXMudml6ID0gdW5kZWZpbmVkXG5cbiAgICAgICAgLy8gb3VyIHRoZW1lXG4gICAgICAgIHRoaXMudGhlbWUgPSB1bmRlZmluZWRcblxuICAgICAgICAvLyBuZXN0ZWQgZGF0YVxuICAgICAgICB0aGlzLmRhdGEgPSB7fVxuXG4gICAgICAgIC8vIHN0b3JlcyB0aGUgY3VycmVudGx5IHNlbGVjdGVkIHZhbHVlIGZpZWxkXG4gICAgICAgIHRoaXMudmFsdWVGaWVsZCA9IFwiRmVkZXJhbFwiO1xuICAgICAgICB0aGlzLnZhbHVlRmllbGRzID0gW1wiRmVkZXJhbFwiLCBcIlN0YXRlXCIsIFwiTG9jYWxcIl07XG5cbiAgICAgICAgLy8gU2V0IHRoZSBzaXplIG9mIG91ciBjb250YWluZXIgZWxlbWVudC5cbiAgICAgICAgdGhpcy52aXpfY29udGFpbmVyID0gZDMuc2VsZWN0QWxsKFwiI3ZpelwiKVxuXG4gICAgICAgIHRoaXMubG9hZERhdGEoKTtcblxuICAgICAgICByZXR1cm4gdGhpc1xuICAgIH0sXG5cbiAgICBwcmVwRGF0YSggY3N2ICkge1xuXG4gICAgICAgIHZhciB2YWx1ZXM9W107XG5cbiAgICAgICAgLy9DbGVhbiBmZWRlcmFsIGJ1ZGdldCBkYXRhIGFuZCByZW1vdmUgYWxsIHJvd3Mgd2hlcmUgYWxsIHZhbHVlcyBhcmUgemVybyBvciBubyBsYWJlbHNcbiAgICAgICAgY3N2LmZvckVhY2goIGQgPT4ge1xuICAgICAgICAgICAgaWYoIHRoaXMudmFsdWVGaWVsZHMucmVkdWNlKCAoIG1lbW8sIGN1ciApID0+IG1lbW8gKyBOdW1iZXIoIGRbIGN1ciBdICksIDAgKSA+IDAgKSB2YWx1ZXMucHVzaCggZCApXG4gICAgICAgIH0gKVxuXG4gICAgICAgIC8vTWFrZSBvdXIgZGF0YSBpbnRvIGEgbmVzdGVkIHRyZWUuICBJZiB5b3UgYWxyZWFkeSBoYXZlIGEgbmVzdGVkIHN0cnVjdHVyZSB5b3UgZG9uJ3QgbmVlZCB0byBkbyB0aGlzLlxuICAgICAgICB2YXIgbmVzdCA9IGQzLm5lc3QoKVxuICAgICAgICAgICAgLmtleSggZCA9PiBkLkxldmVsMSApXG4gICAgICAgICAgICAua2V5KCBkID0+IGQuTGV2ZWwyIClcbiAgICAgICAgICAgIC5rZXkoIGQgPT4gZC5MZXZlbDMgKVxuICAgICAgICAgICAgLmVudHJpZXModmFsdWVzKVxuXG4gICAgICAgIC8vVGhpcyB3aWxsIGJlIGEgdml6LmRhdGEgZnVuY3Rpb247XG4gICAgICAgIHZpenVseS5kYXRhLmFnZ3JlZ2F0ZU5lc3QoIG5lc3QsIHRoaXMudmFsdWVGaWVsZHMsICggYSwgYiApID0+IE51bWJlcihhKSArIE51bWJlcihiKSApXG5cbiAgICAgICAgdmFyIG5vZGU9e307XG4gICAgICAgIG5vZGUudmFsdWVzID0gbmVzdDtcbiAgICAgICAgdGhpcy5yZW1vdmVFbXB0eU5vZGVzKG5vZGUsXCIwXCIsXCIwXCIpO1xuXG4gICAgICAgIHJldHVybiBuZXN0O1xuICAgIH0sXG5cbiAgICAvL1JlbW92ZSBlbXB0eSBjaGlsZCBub2RlcyBsZWZ0IGF0IGVuZCBvZiBhZ2dyZWdhdGlvbiBhbmQgYWRkIHVucWl1ZSBpZHNcbiAgICByZW1vdmVFbXB0eU5vZGVzKCBub2RlLCBwYXJlbnRJZCwgY2hpbGRJZCApIHtcbiAgICAgICAgaWYgKCFub2RlKSByZXR1cm5cbiAgICAgICAgbm9kZS5pZCA9IGAke3BhcmVudElkfV8ke2NoaWxkSWR9YFxuICAgICAgICBpZiAobm9kZS52YWx1ZXMpIHtcbiAgICAgICAgICAgIGZvcih2YXIgaSA9IG5vZGUudmFsdWVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgICAgICAgbm9kZS5pZD1wYXJlbnRJZCArIFwiX1wiICsgaTtcbiAgICAgICAgICAgICAgICBpZighbm9kZS52YWx1ZXNbaV0ua2V5ICYmICFub2RlLnZhbHVlc1tpXS5MZXZlbDQpIHtcbiAgICAgICAgICAgICAgICAgICAgbm9kZS52YWx1ZXMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZW1vdmVFbXB0eU5vZGVzKG5vZGUudmFsdWVzW2ldLG5vZGUuaWQsaSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgc2l6ZSgpIHtcbiAgICAgICAgaWYoIHRoaXMuaW5pdGlhbGl6ZWQgKSB0aGlzLmNoYW5nZVNpemUoIHRoaXMuZWxzLmNvbnRhaW5lci5jbGllbnRXaWR0aCwgdGhpcy5lbHMuY29udGFpbmVyLmNsaWVudEhlaWdodCApXG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgfSxcblxuICAgIHRyaW1MYWJlbCAobGFiZWwpIHtcbiAgICAgICByZXR1cm4gKFN0cmluZyhsYWJlbCkubGVuZ3RoID4gMjApID8gU3RyaW5nKGxhYmVsKS5zdWJzdHIoMCwgMTcpICsgXCIuLi5cIiA6IGxhYmVsXG4gICAgfVxuXG59IClcbiIsIm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmFzc2lnbigge30sIHJlcXVpcmUoJy4vX19wcm90b19fJyksIHtcblxuICAgIGRhdGE6IFtcbiAgICAgICAgeyBsYXQ6IDM5Ljk1MDYxNCwgbG5nOiAtNzUuMTkzNDgxLCBpc09wZW46IHRydWUgfSxcbiAgICAgICAgeyBsYXQ6IDM5Ljk1MDYyMCwgbG5nOiAtNzUuMTkzMzk4LCBpc09wZW46IHRydWUgfSxcbiAgICAgICAgeyBsYXQ6IDM5Ljk1MDU5NSwgbG5nOiAtNzUuMTkzMzE4LCBpc09wZW46IHRydWUgfSxcbiAgICAgICAgeyBsYXQ6IDM5Ljk1MDU4NSwgbG5nOiAtNzUuMTkzMjQxLCBpc09wZW46IHRydWUgfSxcbiAgICAgICAgeyBsYXQ6IDM5Ljk1MDU3MywgbG5nOiAtNzUuMTkzMTM2LCBpc09wZW46IHRydWUgfSxcbiAgICAgICAgeyBsYXQ6IDM5Ljk1MDU2NywgbG5nOiAtNzUuMTkzMDU1LCBpc09wZW46IHRydWUgfSxcbiAgICAgICAgeyBsYXQ6IDM5Ljk1MDQ2NywgbG5nOiAtNzUuMTkzMTI5LCBpc09wZW46IHRydWUgfSxcbiAgICAgICAgeyBsYXQ6IDM5Ljk1MDQ3OSwgbG5nOiAtNzUuMTkzMjE5LCBpc09wZW46IHRydWUgfSxcbiAgICAgICAgeyBsYXQ6IDM5Ljk1MDQ4NiwgbG5nOiAtNzUuMTkzMjcwLCBpc09wZW46IHRydWUgfSxcbiAgICAgICAgeyBsYXQ6IDM5Ljk1MDQ5MiwgbG5nOiAtNzUuMTkzMzE4LCBpc09wZW46IHRydWUgfSxcbiAgICAgICAgeyBsYXQ6IDM5Ljk1MDQ5OSwgbG5nOiAtNzUuMTkzMzg4LCBpc09wZW46IHRydWUgfSxcbiAgICAgICAgeyBsYXQ6IDM5Ljk1MDUxMiwgbG5nOiAtNzUuMTkzNDc5LCBpc09wZW46IHRydWUgfSxcbiAgICAgICAgeyBsYXQ6IDM5Ljk1MDUyMywgbG5nOiAtNzUuMTkzNTY1LCBpc09wZW46IHRydWUgfSxcbiAgICAgICAgeyBsYXQ6IDM5Ljk1MDUzNCwgbG5nOiAtNzUuMTkzNjU1LCBpc09wZW46IHRydWUgfSxcbiAgICAgICAgeyBsYXQ6IDM5Ljk1MDU0OSwgbG5nOiAtNzUuMTkzNzg0LCBpc09wZW46IHRydWUgfSxcbiAgICAgICAgeyBsYXQ6IDM5Ljk1MDU5NiwgbG5nOiAtNzUuMTk0MTUwLCBpc09wZW46IHRydWUgfSxcbiAgICAgICAgeyBsYXQ6IDM5Ljk1MDYxMCwgbG5nOiAtNzUuMTk0MjU2LCBpc09wZW46IHRydWUgfSxcbiAgICAgICAgeyBsYXQ6IDM5Ljk1MDYyNCwgbG5nOiAtNzUuMTk0Mzc2LCBpc09wZW46IHRydWUgfSxcbiAgICAgICAgeyBsYXQ6IDM5Ljk1MDY0MSwgbG5nOiAtNzUuMTk0NTA3LCBpc09wZW46IHRydWUgfSxcbiAgICAgICAgeyBsYXQ6IDM5Ljk1MDY0OSwgbG5nOiAtNzUuMTk0NTkwLCBpc09wZW46IHRydWUgfSxcbiAgICAgICAgeyBsYXQ6IDM5Ljk1MDY1OCwgbG5nOiAtNzUuMTk0NjY2LCBpc09wZW46IHRydWUgfSxcbiAgICAgICAgeyBsYXQ6IDM5Ljk1MDcyOSwgbG5nOiAtNzUuMTk0Mzc3LCBpc09wZW46IHRydWUgfSxcbiAgICAgICAgeyBsYXQ6IDM5Ljk1MDczNSwgbG5nOiAtNzUuMTk0NDMwLCBpc09wZW46IHRydWUgfSxcbiAgICAgICAgeyBsYXQ6IDM5Ljk1MDc0NywgbG5nOiAtNzUuMTk0NTEwLCBpc09wZW46IHRydWUgfSxcbiAgICAgICAgeyBsYXQ6IDM5Ljk1MDc1MiwgbG5nOiAtNzUuMTk0NTg3LCBpc09wZW46IHRydWUgfSxcbiAgICAgICAgeyBsYXQ6IDM5Ljk1MDc2MywgbG5nOiAtNzUuMTk0NjcwLCBpc09wZW46IHRydWUgfVxuICAgIF0sXG5cbiAgICBpbml0TWFwKCkge1xuXG4gICAgICAgIHRoaXMubWFwID0gbmV3IGdvb2dsZS5tYXBzLk1hcCggdGhpcy5lbHMuY29udGFpbmVyLCB7XG4gICAgICAgICAgY2VudGVyOiB7IGxhdDogMzkuOTUwNTYxMSwgbG5nOiAtNzUuMTk0NzAxNCB9LFxuICAgICAgICAgIGRpc2FibGVEZWZhdWx0VUk6IHRydWUsXG4gICAgICAgICAgem9vbTogMThcbiAgICAgICAgfSApXG5cbiAgICAgICAgdGhpcy5kYXRhLmZvckVhY2goIGRhdHVtID0+IHtcbiAgICAgICAgICAgIGRhdHVtLmljb24gPSB7XG4gICAgICAgICAgICAgICAgcGF0aDogXCJNMCAwIEggMTAgViAxMCBIIDAgTCAwIDBcIixcbiAgICAgICAgICAgICAgICBmaWxsQ29sb3I6IGRhdHVtLmlzT3BlbiA/ICdncmVlbicgOiAncmVkJyxcbiAgICAgICAgICAgICAgICBmaWxsT3BhY2l0eTogLjYsXG4gICAgICAgICAgICAgICAgYW5jaG9yOiBuZXcgZ29vZ2xlLm1hcHMuUG9pbnQoMCwwKSxcbiAgICAgICAgICAgICAgICBzdHJva2VXZWlnaHQ6IDAsXG4gICAgICAgICAgICAgICAgc2NhbGU6IDFcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZGF0dW0ubWFya2VyID0gbmV3IGdvb2dsZS5tYXBzLk1hcmtlcigge1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uOiB7IGxhdDogZGF0dW0ubGF0LCBsbmc6IGRhdHVtLmxuZyB9LFxuICAgICAgICAgICAgICAgIG1hcDogdGhpcy5tYXAsXG4gICAgICAgICAgICAgICAgZHJhZ2dhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBpY29uOiBkYXR1bS5pY29uXG4gICAgICAgICAgICB9ICk7XG4gICAgICAgIH0gKVxuXG4gICAgICAgIHNldEludGVydmFsKCAoKSA9PiB0aGlzLnRvZ2dsZVJhbmRvbVNwb3QoKSwgMjAwMCApXG4gICAgfSxcblxuICAgIHBvc3RSZW5kZXIoKSB7XG4gICAgICAgIHdpbmRvdy5nb29nbGVcbiAgICAgICAgICAgID8gdGhpcy5pbml0TWFwKClcbiAgICAgICAgICAgIDogd2luZG93LmluaXRNYXAgPSB0aGlzLmluaXRNYXBcblxuICAgICAgICByZXR1cm4gdGhpc1xuICAgIH0sXG5cbiAgICB0b2dnbGVSYW5kb21TcG90KCkge1xuICAgICAgICBsZXQgZGF0dW0gPSB0aGlzLmRhdGFbIE1hdGguZmxvb3IoIE1hdGgucmFuZG9tKCkgKiB0aGlzLmRhdGEubGVuZ3RoICkgXVxuXG4gICAgICAgIGRhdHVtLmlzT3BlbiA9ICFkYXR1bS5pc09wZW5cbiAgICAgICAgZGF0dW0uaWNvbi5maWxsQ29sb3IgPSBkYXR1bS5pc09wZW4gPyAnZ3JlZW4nIDogJ3JlZCdcbiAgICAgICAgZGF0dW0ubWFya2VyLnNldCggJ2ljb24nLCBkYXR1bS5pY29uIClcbiAgICB9XG5cbn0gKVxuIiwibW9kdWxlLmV4cG9ydHMgPSBPYmplY3QuYXNzaWduKCB7fSwgcmVxdWlyZSgnLi9fX3Byb3RvX18nKSwge1xufSApXG4iLCJtb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5hc3NpZ24oIHt9LCByZXF1aXJlKCcuL19fcHJvdG9fXycpLCB7XG5cbiAgICBoYW5kbGVTaWRlYmFyQ2xpY2soIG5hbWUgKSB7XG4gICAgICAgIGlmKCB0aGlzLnZpZXdzWyBuYW1lIF0gKSByZXR1cm4gdGhpcy52aWV3c1sgbmFtZSBdLnNob3coKVxuXG4gICAgICAgIHRoaXMudmlld3NbIG5hbWUgXSA9IHRoaXMuZmFjdG9yeS5jcmVhdGUoIG5hbWUsIE9iamVjdC5hc3NpZ24oIHsgaW5zZXJ0aW9uOiB7IHZhbHVlOiB7IGVsOiB0aGlzLmVscy5tYWluIH0gfSB9ICkgKVxuICAgIH0sXG5cbiAgICBwb3N0UmVuZGVyKCkge1xuICAgICAgICB0aGlzLnZpZXdzLnNpZGViYXIub24oICdjbGlja2VkJywgdGhpcy5oYW5kbGVTaWRlYmFyQ2xpY2suYmluZCh0aGlzKSApXG4gICAgICAgIHRoaXMudmlld3Muc2lkZWJhci5lbHMubGlzdC5maXJzdENoaWxkLmNsaWNrKClcbiAgICAgICAgcmV0dXJuIHRoaXNcbiAgICB9LFxuICAgIFxuICAgIHNpemUoKSB7XG4gICAgICAgIC8vdGhpcy52aWV3cy5maXJlaG9zZS5lbHMuY29udGFpbmVyLnN0eWxlLmhlaWdodCA9IGAke3RoaXMuZWxzLmNvbnRhaW5lci5jbGllbnRIZWlnaHQgLSB0aGlzLnZpZXdzLmhlYWRlci5lbHMuY29udGFpbmVyLmNsaWVudEhlaWdodH1weGBcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG59IClcbiIsIm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmFzc2lnbigge30sIHJlcXVpcmUoJy4vX19wcm90b19fJyksIHtcblxuICAgIHBvc3RSZW5kZXIoKSB7XG4gICAgICAgIHRoaXMud2lkZ2V0Vmlld3MgPSB7fVxuICAgICAgICB0aGlzLndpZGdldHMuZm9yRWFjaCggd2lkZ2V0ID0+XG4gICAgICAgICAgICB0aGlzLndpZGdldFZpZXdzWyB3aWRnZXQubmFtZSBdID0gdGhpcy5mYWN0b3J5LmNyZWF0ZSggJ3dpZGdldCcsIE9iamVjdC5hc3NpZ24oIHsgbW9kZWw6IHsgdmFsdWU6IHsgZGF0YTogd2lkZ2V0IH0gfSwgaW5zZXJ0aW9uOiB7IHZhbHVlOiB7IGVsOiB0aGlzLmVscy53aWRnZXRzIH0gfSB9ICkgKVxuICAgICAgICApXG4gICAgICAgIHJldHVybiB0aGlzXG4gICAgfSxcblxuICAgIHdpZGdldHM6IFtcbiAgICAgICAgeyBpY29uOiByZXF1aXJlKCcuL3RlbXBsYXRlcy9saWIvdGFnJyksIGxhYmVsOiAnRXZlbnRzJywgbmFtZTogJ2V2ZW50cycsIHZhbHVlOiAnOTgsNjY1JyB9LFxuICAgICAgICB7IGljb246IHJlcXVpcmUoJy4vdGVtcGxhdGVzL2xpYi93aWZpJyksIGxhYmVsOiAnU2Vuc29yIE5vZGVzJywgbmFtZTogJ25vZGVzJywgdmFsdWU6IDE4IH0sXG4gICAgICAgIHsgaWNvbjogcmVxdWlyZSgnLi90ZW1wbGF0ZXMvbGliL3dpZmknKSwgbGFiZWw6ICdTZW5zb3JzIEFjdGl2ZScsIG5hbWU6ICdhY3RpdmVOb2RlcycsIHZhbHVlOiAxOCB9LFxuICAgICAgICB7IGljb246IHJlcXVpcmUoJy4vdGVtcGxhdGVzL2xpYi93aWZpJyksIGxhYmVsOiAnT3BlbiBTcGFjZXMnLCBuYW1lOiAnb3BlblNwYWNlcycsIHZhbHVlOiAzIH0sXG4gICAgICAgIHsgaWNvbjogcmVxdWlyZSgnLi90ZW1wbGF0ZXMvbGliL3dpZmknKSwgbGFiZWw6ICdPY2N1cGllZCBTcGFjZXMnLCBuYW1lOiAnb2NjdXBpZWRTcGFjZXMnLCB2YWx1ZTogMTUgfSxcbiAgICAgICAgeyBpY29uOiByZXF1aXJlKCcuL3RlbXBsYXRlcy9saWIvd2lmaScpLCBsYWJlbDogJ1JldmVudWUnLCBuYW1lOiAncmV2ZW51ZScsIHZhbHVlOiAnJDE5OCwyMjgnIH1cbiAgICBdXG5cbn0gKVxuIiwibW9kdWxlLmV4cG9ydHMgPSBPYmplY3QuYXNzaWduKCB7fSwgcmVxdWlyZSgnLi9fX3Byb3RvX18nKSwge1xuXG4gICAgZXZlbnRzOiB7XG4gICAgICAgIGxpc3Q6ICdjbGljaydcbiAgICB9LFxuXG4gICAgZ2V0VGVtcGxhdGVPcHRpb25zKCkgeyByZXR1cm4gdGhpcy5kYXRhIH0sXG5cbiAgICBkYXRhOiBbXG4gICAgICAgIHsgaWNvbjogcmVxdWlyZSgnLi90ZW1wbGF0ZXMvbGliL2hvbWUnKSwgbGFiZWw6ICdPdmVydmlldycsIG5hbWU6ICdvdmVydmlldycgfSxcbiAgICAgICAgeyBpY29uOiByZXF1aXJlKCcuL3RlbXBsYXRlcy9saWIvZG9sbGFyJyksIGxhYmVsOiAnQVBJIFJldmVudWUnLCBuYW1lOiAnYXBpJyB9LFxuICAgICAgICB7IGljb246IHJlcXVpcmUoJy4vdGVtcGxhdGVzL2xpYi9sb2NhdGlvbicpLCBsYWJlbDogJ0dlbycsIG5hbWU6ICdmaXJlaG9zZScgfVxuICAgIF0sXG5cbiAgICBvbkxpc3RDbGljayggZSApIHtcbiAgICAgICAgY29uc3QgaXRlbUVsID0gZS50YXJnZXQudGFnTmFtZSA9PT0gXCJMSVwiID8gZS50YXJnZXQgOiBlLnRhcmdldC5jbG9zZXN0KCdsaScpXG4gICAgICAgIHRoaXMuZW1pdCggJ2NsaWNrZWQnLCBpdGVtRWwuZ2V0QXR0cmlidXRlKCdkYXRhLW5hbWUnKSApXG4gICAgfSxcblxuICAgIHNpemUoKSB7XG4gICAgICAgIHRoaXMuZWxzLmxpc3Quc3R5bGUuaGVpZ2h0ID0gYCR7dGhpcy5lbHMuY29udGFpbmVyLmNsaWVudEhlaWdodCAtIHRoaXMuZWxzLmhlYWRlci5jbGllbnRIZWlnaHR9cHhgXG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgfVxufSApXG4iLCJtb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5hc3NpZ24oIHt9LCByZXF1aXJlKCcuL19fcHJvdG9fXycpLCB7XG5cbn0gKVxuIiwibW9kdWxlLmV4cG9ydHMgPSBPYmplY3QuYXNzaWduKCB7IH0sIHJlcXVpcmUoJy4uLy4uLy4uL2xpYi9NeU9iamVjdCcpLCByZXF1aXJlKCdldmVudHMnKS5FdmVudEVtaXR0ZXIucHJvdG90eXBlLCB7XG5cbiAgICBPcHRpbWl6ZWRSZXNpemU6IHJlcXVpcmUoJy4vbGliL09wdGltaXplZFJlc2l6ZScpLFxuICAgIFxuICAgIFhocjogcmVxdWlyZSgnLi4vWGhyJyksXG5cbiAgICBiaW5kRXZlbnQoIGtleSwgZXZlbnQgKSB7XG4gICAgICAgIHZhciBlbHMgPSBBcnJheS5pc0FycmF5KCB0aGlzLmVsc1sga2V5IF0gKSA/IHRoaXMuZWxzWyBrZXkgXSA6IFsgdGhpcy5lbHNbIGtleSBdIF1cbiAgICAgICAgZWxzLmZvckVhY2goIGVsID0+IGVsLmFkZEV2ZW50TGlzdGVuZXIoIGV2ZW50IHx8ICdjbGljaycsIGUgPT4gdGhpc1sgYG9uJHt0aGlzLmNhcGl0YWxpemVGaXJzdExldHRlcihrZXkpfSR7dGhpcy5jYXBpdGFsaXplRmlyc3RMZXR0ZXIoZXZlbnQpfWAgXSggZSApICkgKVxuICAgIH0sXG5cbiAgICBjYXBpdGFsaXplRmlyc3RMZXR0ZXI6IHN0cmluZyA9PiBzdHJpbmcuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBzdHJpbmcuc2xpY2UoMSksXG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcblxuXG4gICAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKCB0aGlzLCB7IGVsczogeyB9LCBzbHVycDogeyBhdHRyOiAnZGF0YS1qcycsIHZpZXc6ICdkYXRhLXZpZXcnIH0sIHZpZXdzOiB7IH0gfSApLnJlbmRlcigpXG4gICAgfSxcblxuICAgIGRlbGVnYXRlRXZlbnRzKCBrZXksIGVsICkge1xuICAgICAgICB2YXIgdHlwZSA9IHR5cGVvZiB0aGlzLmV2ZW50c1trZXldXG5cbiAgICAgICAgaWYoIHR5cGUgPT09IFwic3RyaW5nXCIgKSB7IHRoaXMuYmluZEV2ZW50KCBrZXksIHRoaXMuZXZlbnRzW2tleV0gKSB9XG4gICAgICAgIGVsc2UgaWYoIEFycmF5LmlzQXJyYXkoIHRoaXMuZXZlbnRzW2tleV0gKSApIHtcbiAgICAgICAgICAgIHRoaXMuZXZlbnRzWyBrZXkgXS5mb3JFYWNoKCBldmVudE9iaiA9PiB0aGlzLmJpbmRFdmVudCgga2V5LCBldmVudE9iai5ldmVudCApIClcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuYmluZEV2ZW50KCBrZXksIHRoaXMuZXZlbnRzW2tleV0uZXZlbnQgKVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIGRlbGV0ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaGlkZSgpXG4gICAgICAgIC50aGVuKCAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmVscy5jb250YWluZXIucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCggdGhpcy5lbHMuY29udGFpbmVyIClcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoIHRoaXMuZW1pdCgnZGVsZXRlZCcpIClcbiAgICAgICAgfSApXG4gICAgfSxcblxuICAgIGV2ZW50czoge30sXG5cbiAgICBnZXREYXRhKCkge1xuICAgICAgICBpZiggIXRoaXMubW9kZWwgKSB0aGlzLm1vZGVsID0gT2JqZWN0LmNyZWF0ZSggdGhpcy5Nb2RlbCwgeyByZXNvdXJjZTogeyB2YWx1ZTogdGhpcy5uYW1lIH0gfSApXG5cbiAgICAgICAgcmV0dXJuIHRoaXMubW9kZWwuZ2V0KClcbiAgICB9LFxuXG4gICAgZ2V0VGVtcGxhdGVPcHRpb25zKCkge1xuICAgICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbihcbiAgICAgICAgICAgIHt9LFxuICAgICAgICAgICAgKHRoaXMubW9kZWwpID8gdGhpcy5tb2RlbC5kYXRhIDoge30gLFxuICAgICAgICAgICAgeyB1c2VyOiAodGhpcy51c2VyKSA/IHRoaXMudXNlci5kYXRhIDoge30gfSxcbiAgICAgICAgICAgIHsgb3B0czogKHRoaXMudGVtcGxhdGVPcHRzKSA/IHRoaXMudGVtcGxhdGVPcHRzIDoge30gfVxuICAgICAgICApXG4gICAgfSxcblxuICAgIGhpZGUoKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSggcmVzb2x2ZSA9PiB7XG4gICAgICAgICAgICBpZiggIWRvY3VtZW50LmJvZHkuY29udGFpbnModGhpcy5lbHMuY29udGFpbmVyKSB8fCB0aGlzLmlzSGlkZGVuKCkgKSByZXR1cm4gcmVzb2x2ZSgpXG4gICAgICAgICAgICB0aGlzLm9uSGlkZGVuUHJveHkgPSBlID0+IHRoaXMub25IaWRkZW4ocmVzb2x2ZSlcbiAgICAgICAgICAgIHRoaXMuZWxzLmNvbnRhaW5lci5hZGRFdmVudExpc3RlbmVyKCAndHJhbnNpdGlvbmVuZCcsIHRoaXMub25IaWRkZW5Qcm94eSApXG4gICAgICAgICAgICB0aGlzLmVscy5jb250YWluZXIuY2xhc3NMaXN0LmFkZCgnaGlkZScpXG4gICAgICAgIH0gKVxuICAgIH0sXG5cbiAgICBodG1sVG9GcmFnbWVudCggc3RyICkge1xuICAgICAgICBsZXQgcmFuZ2UgPSBkb2N1bWVudC5jcmVhdGVSYW5nZSgpO1xuICAgICAgICAvLyBtYWtlIHRoZSBwYXJlbnQgb2YgdGhlIGZpcnN0IGRpdiBpbiB0aGUgZG9jdW1lbnQgYmVjb21lcyB0aGUgY29udGV4dCBub2RlXG4gICAgICAgIHJhbmdlLnNlbGVjdE5vZGUoZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJkaXZcIikuaXRlbSgwKSlcbiAgICAgICAgcmV0dXJuIHJhbmdlLmNyZWF0ZUNvbnRleHR1YWxGcmFnbWVudCggc3RyIClcbiAgICB9LFxuICAgIFxuICAgIGlzSGlkZGVuKCkgeyByZXR1cm4gdGhpcy5lbHMuY29udGFpbmVyLmNsYXNzTGlzdC5jb250YWlucygnaGlkZGVuJykgfSxcblxuICAgIG9uSGlkZGVuKCByZXNvbHZlICkge1xuICAgICAgICB0aGlzLmVscy5jb250YWluZXIucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ3RyYW5zaXRpb25lbmQnLCB0aGlzLm9uSGlkZGVuUHJveHkgKVxuICAgICAgICB0aGlzLmVscy5jb250YWluZXIuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJylcbiAgICAgICAgcmVzb2x2ZSggdGhpcy5lbWl0KCdoaWRkZW4nKSApXG4gICAgfSxcblxuICAgIG9uTG9naW4oKSB7XG4gICAgICAgIE9iamVjdC5hc3NpZ24oIHRoaXMsIHsgZWxzOiB7IH0sIHNsdXJwOiB7IGF0dHI6ICdkYXRhLWpzJywgdmlldzogJ2RhdGEtdmlldycgfSwgdmlld3M6IHsgfSB9ICkucmVuZGVyKClcbiAgICB9LFxuXG4gICAgb25TaG93biggcmVzb2x2ZSApIHtcbiAgICAgICAgdGhpcy5lbHMuY29udGFpbmVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoICd0cmFuc2l0aW9uZW5kJywgdGhpcy5vblNob3duUHJveHkgKVxuICAgICAgICBpZiggdGhpcy5zaXplICkgdGhpcy5zaXplKClcbiAgICAgICAgcmVzb2x2ZSggdGhpcy5lbWl0KCdzaG93bicpIClcbiAgICB9LFxuXG4gICAgc2hvd05vQWNjZXNzKCkge1xuICAgICAgICBhbGVydChcIk5vIHByaXZpbGVnZXMsIHNvblwiKVxuICAgICAgICByZXR1cm4gdGhpc1xuICAgIH0sXG5cbiAgICBwb3N0UmVuZGVyKCkgeyByZXR1cm4gdGhpcyB9LFxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICB0aGlzLnNsdXJwVGVtcGxhdGUoIHsgdGVtcGxhdGU6IHRoaXMudGVtcGxhdGUoIHRoaXMuZ2V0VGVtcGxhdGVPcHRpb25zKCkgKSwgaW5zZXJ0aW9uOiB0aGlzLmluc2VydGlvbiB9IClcblxuICAgICAgICB0aGlzLnJlbmRlclN1YnZpZXdzKClcblxuICAgICAgICBpZiggdGhpcy5zaXplICkgeyB0aGlzLnNpemUoKTsgdGhpcy5PcHRpbWl6ZWRSZXNpemUuYWRkKCB0aGlzLnNpemUuYmluZCh0aGlzKSApIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5wb3N0UmVuZGVyKClcbiAgICB9LFxuXG4gICAgcmVuZGVyU3Vidmlld3MoKSB7XG4gICAgICAgIE9iamVjdC5rZXlzKCB0aGlzLlZpZXdzIHx8IHsgfSApLmZvckVhY2goIGtleSA9PiB7XG4gICAgICAgICAgICBpZiggdGhpcy5WaWV3c1sga2V5IF0uZWwgKSB7XG4gICAgICAgICAgICAgICAgbGV0IG9wdHMgPSB0aGlzLlZpZXdzWyBrZXkgXS5vcHRzXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgb3B0cyA9ICggb3B0cyApXG4gICAgICAgICAgICAgICAgICAgID8gdHlwZW9mIG9wdHMgPT09IFwib2JqZWN0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgID8gb3B0c1xuICAgICAgICAgICAgICAgICAgICAgICAgOiBvcHRzKClcbiAgICAgICAgICAgICAgICAgICAgOiB7fVxuXG4gICAgICAgICAgICAgICAgdGhpcy52aWV3c1sga2V5IF0gPSB0aGlzLmZhY3RvcnkuY3JlYXRlKCBrZXksIE9iamVjdC5hc3NpZ24oIHsgaW5zZXJ0aW9uOiB7IHZhbHVlOiB7IGVsOiB0aGlzLlZpZXdzWyBrZXkgXS5lbCwgbWV0aG9kOiAnaW5zZXJ0QmVmb3JlJyB9IH0gfSwgb3B0cyApIClcbiAgICAgICAgICAgICAgICB0aGlzLlZpZXdzWyBrZXkgXS5lbC5yZW1vdmUoKVxuICAgICAgICAgICAgICAgIHRoaXMuVmlld3NbIGtleSBdLmVsID0gdW5kZWZpbmVkXG4gICAgICAgICAgICB9XG4gICAgICAgIH0gKVxuXG4gICAgICAgIHJldHVybiB0aGlzXG4gICAgfSxcblxuICAgIHNob3coIGR1cmF0aW9uICkge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoIHJlc29sdmUgPT4ge1xuICAgICAgICAgICAgdGhpcy5vblNob3duUHJveHkgPSBlID0+IHRoaXMub25TaG93bihyZXNvbHZlKVxuICAgICAgICAgICAgdGhpcy5lbHMuY29udGFpbmVyLmFkZEV2ZW50TGlzdGVuZXIoICd0cmFuc2l0aW9uZW5kJywgdGhpcy5vblNob3duUHJveHkgKVxuICAgICAgICAgICAgdGhpcy5lbHMuY29udGFpbmVyLmNsYXNzTGlzdC5yZW1vdmUoICdoaWRlJywgJ2hpZGRlbicgKVxuICAgICAgICB9IClcbiAgICB9LFxuXG4gICAgc2x1cnBFbCggZWwgKSB7XG4gICAgICAgIHZhciBrZXkgPSBlbC5nZXRBdHRyaWJ1dGUoIHRoaXMuc2x1cnAuYXR0ciApIHx8ICdjb250YWluZXInXG5cbiAgICAgICAgaWYoIGtleSA9PT0gJ2NvbnRhaW5lcicgKSBlbC5jbGFzc0xpc3QuYWRkKCB0aGlzLm5hbWUgKVxuXG4gICAgICAgIHRoaXMuZWxzWyBrZXkgXSA9IEFycmF5LmlzQXJyYXkoIHRoaXMuZWxzWyBrZXkgXSApXG4gICAgICAgICAgICA/IHRoaXMuZWxzWyBrZXkgXS5wdXNoKCBlbCApXG4gICAgICAgICAgICA6ICggdGhpcy5lbHNbIGtleSBdICE9PSB1bmRlZmluZWQgKVxuICAgICAgICAgICAgICAgID8gWyB0aGlzLmVsc1sga2V5IF0sIGVsIF1cbiAgICAgICAgICAgICAgICA6IGVsXG5cbiAgICAgICAgZWwucmVtb3ZlQXR0cmlidXRlKHRoaXMuc2x1cnAuYXR0cilcblxuICAgICAgICBpZiggdGhpcy5ldmVudHNbIGtleSBdICkgdGhpcy5kZWxlZ2F0ZUV2ZW50cygga2V5LCBlbCApXG4gICAgfSxcblxuICAgIHNsdXJwVGVtcGxhdGUoIG9wdGlvbnMgKSB7XG4gICAgICAgIHZhciBmcmFnbWVudCA9IHRoaXMuaHRtbFRvRnJhZ21lbnQoIG9wdGlvbnMudGVtcGxhdGUgKSxcbiAgICAgICAgICAgIHNlbGVjdG9yID0gYFske3RoaXMuc2x1cnAuYXR0cn1dYCxcbiAgICAgICAgICAgIHZpZXdTZWxlY3RvciA9IGBbJHt0aGlzLnNsdXJwLnZpZXd9XWBcblxuICAgICAgICB0aGlzLnNsdXJwRWwoIGZyYWdtZW50LnF1ZXJ5U2VsZWN0b3IoJyonKSApXG4gICAgICAgIGZyYWdtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoIGAke3NlbGVjdG9yfSwgJHt2aWV3U2VsZWN0b3J9YCApLmZvckVhY2goIGVsID0+IHtcbiAgICAgICAgICAgIGlmKCBlbC5oYXNBdHRyaWJ1dGUoIHRoaXMuc2x1cnAuYXR0ciApICkgeyB0aGlzLnNsdXJwRWwoIGVsICkgfVxuICAgICAgICAgICAgZWxzZSBpZiggZWwuaGFzQXR0cmlidXRlKCB0aGlzLnNsdXJwLnZpZXcgKSApIHtcbiAgICAgICAgICAgICAgICBpZiggISB0aGlzLlZpZXdzWyBlbC5nZXRBdHRyaWJ1dGUodGhpcy5zbHVycC52aWV3KSBdICkgdGhpcy5WaWV3c1sgZWwuZ2V0QXR0cmlidXRlKHRoaXMuc2x1cnAudmlldykgXSA9IHsgfVxuICAgICAgICAgICAgICAgIHRoaXMuVmlld3NbIGVsLmdldEF0dHJpYnV0ZSh0aGlzLnNsdXJwLnZpZXcpIF0uZWwgPSBlbFxuICAgICAgICAgICAgfVxuICAgICAgICB9IClcbiAgICAgICAgICBcbiAgICAgICAgb3B0aW9ucy5pbnNlcnRpb24ubWV0aG9kID09PSAnaW5zZXJ0QmVmb3JlJ1xuICAgICAgICAgICAgPyBvcHRpb25zLmluc2VydGlvbi5lbC5wYXJlbnROb2RlLmluc2VydEJlZm9yZSggZnJhZ21lbnQsIG9wdGlvbnMuaW5zZXJ0aW9uLmVsIClcbiAgICAgICAgICAgIDogb3B0aW9ucy5pbnNlcnRpb24uZWxbIG9wdGlvbnMuaW5zZXJ0aW9uLm1ldGhvZCB8fCAnYXBwZW5kQ2hpbGQnIF0oIGZyYWdtZW50IClcblxuICAgICAgICByZXR1cm4gdGhpc1xuICAgIH1cbn0gKVxuIiwibW9kdWxlLmV4cG9ydHMgPSBPYmplY3QuY3JlYXRlKCB7XG5cbiAgICBhZGQoY2FsbGJhY2spIHtcbiAgICAgICAgaWYoICF0aGlzLmNhbGxiYWNrcy5sZW5ndGggKSB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdGhpcy5vblJlc2l6ZS5iaW5kKHRoaXMpIClcbiAgICAgICAgdGhpcy5jYWxsYmFja3MucHVzaChjYWxsYmFjaylcbiAgICB9LFxuXG4gICAgb25SZXNpemUoKSB7XG4gICAgICAgaWYoIHRoaXMucnVubmluZyApIHJldHVyblxuXG4gICAgICAgIHRoaXMucnVubmluZyA9IHRydWVcbiAgICAgICAgXG4gICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWVcbiAgICAgICAgICAgID8gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSggdGhpcy5ydW5DYWxsYmFja3MuYmluZCh0aGlzKSApXG4gICAgICAgICAgICA6IHNldFRpbWVvdXQoIHRoaXMucnVuQ2FsbGJhY2tzLCA2NilcbiAgICB9LFxuXG4gICAgcnVuQ2FsbGJhY2tzKCkge1xuICAgICAgICB0aGlzLmNhbGxiYWNrcyA9IHRoaXMuY2FsbGJhY2tzLmZpbHRlciggY2FsbGJhY2sgPT4gY2FsbGJhY2soKSApXG4gICAgICAgIHRoaXMucnVubmluZyA9IGZhbHNlIFxuICAgIH1cblxufSwgeyBjYWxsYmFja3M6IHsgd3JpdGFibGU6IHRydWUsIHZhbHVlOiBbXSB9LCBydW5uaW5nOiB7IHdyaXRhYmxlOiB0cnVlLCB2YWx1ZTogZmFsc2UgfSB9IClcbiIsIm1vZHVsZS5leHBvcnRzID0gcCA9PiBcbmA8ZGl2PlxuICAgIDxkaXYgY2xhc3M9XCJoZWFkZXJcIj5FdmVudHMgb3ZlciB0aW1lPC9kaXY+XG4gICAgPGRpdiBkYXRhLWpzPVwiZ3JhcGhcIj48L2Rpdj5cbjwvZGl2PmBcbiIsIm1vZHVsZS5leHBvcnRzID0gcCA9PiBgPGRpdiBpZD1cInZpelwiPjwvZGl2PmBcbiIsIm1vZHVsZS5leHBvcnRzID0gcCA9PiBgPGRpdj48L2Rpdj5gXG4iLCJtb2R1bGUuZXhwb3J0cyA9IHAgPT5cbmA8ZGl2PlxuICAgIDxzcGFuPkNoaW5hIFVuaWNvbTwvc3Bhbj5cbiAgICA8ZGl2PlxuICAgICAgICA8aW5wdXQgZGF0YS1qcz1cImZyb21cIiB0eXBlPVwidGV4dFwiIC8+XG4gICAgICAgIDxzcGFuPnRvPC9zcGFuPlxuICAgICAgICA8aW5wdXQgZGF0YS1qcz1cInRvXCIgdHlwZT1cInRleHRcIiAvPlxuICAgIDwvZGl2PlxuPC9kaXY+YFxuIiwibW9kdWxlLmV4cG9ydHMgPSBwID0+IFxuYDxkaXYgY2xhc3M9XCJjbGVhZml4XCI+XG4gICAgPGRpdiBkYXRhLXZpZXc9XCJzaWRlYmFyXCI+PC9kaXY+XG4gICAgPGRpdiBkYXRhLWpzPVwibWFpblwiIGNsYXNzPVwibWFpblwiPjwvZGl2PlxuPC9kaXY+YFxuIiwibW9kdWxlLmV4cG9ydHMgPSBwID0+XG5gPGRpdj5cbiAgICA8ZGl2IGNsYXNzPVwiaGVhZGVyIGNsZWFyZml4XCI+XG4gICAgICAgIDxzcGFuIGNsYXNzPVwiaGVhZGluZ1wiPk92ZXJ2aWV3PC9zcGFuPlxuICAgICAgICA8ZGl2IGNsYXNzPVwiZGF0ZXNcIj5cbiAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwidGV4dFwiIGRhdGEtanM9XCJmcm9tXCIgLz5cbiAgICAgICAgICAgIDxzcGFuPnRvPC9zcGFuPlxuICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJ0ZXh0XCIgZGF0YS1qcz1cInRvXCIgLz5cbiAgICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gICAgPGRpdiBkYXRhLWpzPVwid2lkZ2V0c1wiPjwvZGl2PlxuICAgIDxkaXYgY2xhc3M9XCJ1c2VyLWRhdGEtcm93IGNsZWFyZml4XCI+XG4gICAgICAgIDxkaXY+XG4gICAgICAgICAgICA8c3BhbiBjbGFzcz1cImxhYmVsXCI+VXNlcnM8L3NwYW4+XG4gICAgICAgICAgICA8c3BhbiBjbGFzcz1cInZhbHVlXCI+NDc4PC9zcGFuPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdj5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwibGFiZWxcIj5Vc2VyYmFzZXMgQWN0aXZlPC9zcGFuPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJ2YWx1ZVwiPjgxLjUlPC9zcGFuPlxuICAgICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgICA8ZGl2PlxuICAgICAgICA8ZGl2IGRhdGEtdmlldz1cImV2ZW50c1wiPjwvZGl2PlxuICAgICAgICA8ZGl2IGRhdGEtanM9XCJzZW5zb3JzXCI+PC9kaXY+XG4gICAgPC9kaXY+XG48L2Rpdj5gXG4iLCJtb2R1bGUuZXhwb3J0cyA9IHAgPT4ge1xuICAgIGNvbnN0IGxpc3QgPSBwLm1hcCggaXRlbSA9PiBgPGxpIGRhdGEtbmFtZT1cIiR7aXRlbS5uYW1lfVwiIGNsYXNzPVwiY2xlYXJmaXhcIj4ke2l0ZW0uaWNvbn08c3BhbiBjbGFzcz1cImxhYmVsXCI+JHtpdGVtLmxhYmVsfTwvc3Bhbj48L2xpPmAgKS5qb2luKCcnKVxuICAgIHJldHVybiBgPGRpdj5cbiAgICAgICAgPGRpdiBkYXRhLWpzPVwiaGVhZGVyXCIgY2xhc3M9XCJoZWFkZXJcIj5cbiAgICAgICAgICAgIDxpbWcgY2xhc3M9XCJsb2dvXCIgc3JjPVwiL3N0YXRpYy9pbWcvbG9nby5wbmdcIi8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8dWwgZGF0YS1qcz1cImxpc3RcIj4ke2xpc3R9PC91bD5cbiAgICA8L2Rpdj5gXG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHAgPT5cbmA8ZGl2PlxuICAgIDxkaXY+JHtwLmljb259PC9kaXY+XG4gICAgPGRpdiBkYXRhLWpzPVwidmFsdWVcIiBjbGFzcz1cInZhbHVlXCI+JHtwLnZhbHVlfTwvZGl2PlxuICAgIDxkaXYgY2xhc3M9XCJsYWJlbFwiPiR7cC5sYWJlbH08L2Rpdj5cbjwvZGl2PmBcbiIsIm1vZHVsZS5leHBvcnRzID0gYDxzdmcgdmVyc2lvbj1cIjEuMVwiIGlkPVwiQ2FwYV8xXCIgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHhtbG5zOnhsaW5rPVwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGlua1wiIHg9XCIwcHhcIiB5PVwiMHB4XCJcclxuXHQgd2lkdGg9XCI2MTEuOTk0cHhcIiBoZWlnaHQ9XCI2MTEuOTk0cHhcIiB2aWV3Qm94PVwiMCAwIDYxMS45OTQgNjExLjk5NFwiIHN0eWxlPVwiZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA2MTEuOTk0IDYxMS45OTQ7XCJcclxuXHQgeG1sOnNwYWNlPVwicHJlc2VydmVcIj5cclxuPGc+XHJcbiAgICA8cGF0aCBkPVwiTTMwNi4wMDksNDgxLjMwM2MtNTUuNTk1LDAtMTAwLjgzMy00Mi42MjEtMTAwLjgzMy05NS4wMDRjMC04LjEyMiw2LjU4MS0xNC43MDMsMTQuNzAzLTE0LjcwM1xyXG4gICAgICAgIHMxNC43MDMsNi41ODEsMTQuNzAzLDE0LjcwM2MwLDM2LjE2OSwzMi4wNDEsNjUuNiw3MS40MjcsNjUuNnM3MS40MTUtMjkuNDMxLDcxLjQxNS02NS42YzAtMzYuMTctMzIuMDM1LTY1LjU5OS03MS40MTUtNjUuNTk5XHJcbiAgICAgICAgYy01NS41OTUsMC0xMDAuODMzLTQyLjYyMS0xMDAuODMzLTk1LjAwNGMwLTUyLjM4NCw0NS4yMzgtOTUuMDA0LDEwMC44MzMtOTUuMDA0YzI5Ljg1NCwwLDU3Ljk4OCwxMi4zNTEsNzcuMTk2LDMzLjg4N1xyXG4gICAgICAgIGM1LjQwNCw2LjA2Myw0Ljg2OSwxNS4zNTUtMS4xODgsMjAuNzZjLTYuMDU4LDUuNDExLTE1LjM1NCw0Ljg3LTIwLjc2LTEuMTg4Yy0xMy42MjctMTUuMjg1LTMzLjc2NC0yNC4wNTQtNTUuMjQ4LTI0LjA1NFxyXG4gICAgICAgIGMtMzkuMzgsMC03MS40MjcsMjkuNDIzLTcxLjQyNyw2NS41OTljMCwzNi4xNjksMzIuMDQxLDY1LjU5OCw3MS40MjcsNjUuNTk4YzU1LjU5NiwwLDEwMC44MjEsNDIuNjIxLDEwMC44MjEsOTUuMDA1XHJcbiAgICAgICAgQzQwNi44MzYsNDM4LjY4MiwzNjEuNjA0LDQ4MS4zMDMsMzA2LjAwOSw0ODEuMzAzelwiLz5cclxuICAgIDxwYXRoIGQ9XCJNMzAzLjMxNSw1MjUuMjM1Yy04LjEyMiwwLTE0LjcwMy02LjU4MS0xNC43MDMtMTQuNzAzdi00MDkuMDdjMC04LjEyMiw2LjU4MS0xNC43MDMsMTQuNzAzLTE0LjcwM1xyXG4gICAgICAgIGM4LjEyMywwLDE0LjcwMyw2LjU4MSwxNC43MDMsMTQuNzAzdjQwOS4wN0MzMTguMDE5LDUxOC42NTQsMzExLjQzOCw1MjUuMjM1LDMwMy4zMTUsNTI1LjIzNXpcIi8+XHJcbjwvZz5cclxuPC9zdmc+YFxyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IGA8c3ZnIHZlcnNpb249XCIxLjFcIiBpZD1cIkNhcGFfMVwiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB4bWxuczp4bGluaz1cImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmtcIiB4PVwiMHB4XCIgeT1cIjBweFwiXHJcblx0IHZpZXdCb3g9XCIwIDAgNTguMzY1IDU4LjM2NVwiIHN0eWxlPVwiZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1OC4zNjUgNTguMzY1O1wiIHhtbDpzcGFjZT1cInByZXNlcnZlXCI+XHJcbjxwYXRoIGQ9XCJNNTcuODYzLDI2LjYzMmwtOC42ODEtOC4wNjFWNS4zNjVoLTEwdjMuOTIxTDI5LjE4MiwwTDAuNTAyLDI2LjYzMmMtMC40MDQsMC4zNzYtMC40MjgsMS4wMDktMC4wNTIsMS40MTRcclxuXHRjMC4zNzUsMC40MDQsMS4wMDgsMC40MjcsMS40MTQsMC4wNTJsMy4zMTktMy4wODJ2MzMuMzQ5aDE2aDE2aDE2VjI1LjAxNWwzLjMxOSwzLjA4MmMwLjE5MiwwLjE3OSwwLjQzNywwLjI2NywwLjY4MSwwLjI2N1xyXG5cdGMwLjI2OSwwLDAuNTM2LTAuMTA3LDAuNzMyLTAuMzE5QzU4LjI5MSwyNy42NDEsNTguMjY3LDI3LjAwOCw1Ny44NjMsMjYuNjMyeiBNNDEuMTgyLDcuMzY1aDZ2OS4zNDlsLTYtNS41NzFWNy4zNjV6XHJcblx0IE0yMy4xODIsNTYuMzY1VjM1LjMwMmMwLTAuNTE3LDAuNDItMC45MzcsMC45MzctMC45MzdoMTAuMTI2YzAuNTE3LDAsMC45MzcsMC40MiwwLjkzNywwLjkzN3YyMS4wNjNIMjMuMTgyeiBNNTEuMTgyLDU2LjM2NWgtMTRcclxuXHRWMzUuMzAyYzAtMS42Mi0xLjMxNy0yLjkzNy0yLjkzNy0yLjkzN0gyNC4xMTljLTEuNjIsMC0yLjkzNywxLjMxNy0yLjkzNywyLjkzN3YyMS4wNjNoLTE0VjIzLjE1OGwyMi0yMC40MjlsMTQuMjgsMTMuMjZcclxuXHRsNS43Miw1LjMxMXYwbDIsMS44NTdWNTYuMzY1elwiLz5cclxuPC9zdmc+YFxyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IGBcclxuPHN2ZyB2ZXJzaW9uPVwiMS4xXCIgaWQ9XCJDYXBhXzFcIiB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgeG1sbnM6eGxpbms9XCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rXCIgeD1cIjBweFwiIHk9XCIwcHhcIlxyXG5cdCB3aWR0aD1cIjQ5MS41ODJweFwiIGhlaWdodD1cIjQ5MS41ODJweFwiIHZpZXdCb3g9XCIwIDAgNDkxLjU4MiA0OTEuNTgyXCIgc3R5bGU9XCJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDQ5MS41ODIgNDkxLjU4MjtcIlxyXG5cdCB4bWw6c3BhY2U9XCJwcmVzZXJ2ZVwiPlxyXG48Zz5cclxuXHQ8Zz5cclxuXHRcdDxwYXRoIGQ9XCJNMjQ1Ljc5MSwwQzE1My43OTksMCw3OC45NTcsNzQuODQxLDc4Ljk1NywxNjYuODMzYzAsMzYuOTY3LDIxLjc2NCw5My4xODcsNjguNDkzLDE3Ni45MjZcclxuXHRcdFx0YzMxLjg4Nyw1Ny4xMzgsNjMuNjI3LDEwNS40LDY0Ljk2NiwxMDcuNDMzbDIyLjk0MSwzNC43NzNjMi4zMTMsMy41MDcsNi4yMzIsNS42MTcsMTAuNDM0LDUuNjE3czguMTIxLTIuMTEsMTAuNDM0LTUuNjE3XHJcblx0XHRcdGwyMi45NC0zNC43NzFjMS4zMjYtMi4wMSwzMi44MzUtNDkuODU1LDY0Ljk2Ny0xMDcuNDM1YzQ2LjcyOS04My43MzUsNjguNDkzLTEzOS45NTUsNjguNDkzLTE3Ni45MjZcclxuXHRcdFx0QzQxMi42MjUsNzQuODQxLDMzNy43ODMsMCwyNDUuNzkxLDB6IE0zMjIuMzAyLDMzMS41NzZjLTMxLjY4NSw1Ni43NzUtNjIuNjk2LDEwMy44NjktNjQuMDAzLDEwNS44NDhsLTEyLjUwOCwxOC45NTlcclxuXHRcdFx0bC0xMi41MDQtMTguOTU0Yy0xLjMxNC0xLjk5NS0zMi41NjMtNDkuNTExLTY0LjAwNy0xMDUuODUzYy00My4zNDUtNzcuNjc2LTY1LjMyMy0xMzMuMTA0LTY1LjMyMy0xNjQuNzQzXHJcblx0XHRcdEMxMDMuOTU3LDg4LjYyNiwxNjcuNTgzLDI1LDI0NS43OTEsMjVzMTQxLjgzNCw2My42MjYsMTQxLjgzNCwxNDEuODMzQzM4Ny42MjUsMTk4LjQ3NiwzNjUuNjQ3LDI1My45MDIsMzIyLjMwMiwzMzEuNTc2elwiLz5cclxuXHRcdDxwYXRoIGQ9XCJNMjQ1Ljc5MSw3My4yOTFjLTUxLjAwNSwwLTkyLjUsNDEuNDk2LTkyLjUsOTIuNXM0MS40OTUsOTIuNSw5Mi41LDkyLjVzOTIuNS00MS40OTYsOTIuNS05Mi41XHJcblx0XHRcdFMyOTYuNzk2LDczLjI5MSwyNDUuNzkxLDczLjI5MXogTTI0NS43OTEsMjMzLjI5MWMtMzcuMjIsMC02Ny41LTMwLjI4LTY3LjUtNjcuNXMzMC4yOC02Ny41LDY3LjUtNjcuNVxyXG5cdFx0XHRjMzcuMjIxLDAsNjcuNSwzMC4yOCw2Ny41LDY3LjVTMjgzLjAxMiwyMzMuMjkxLDI0NS43OTEsMjMzLjI5MXpcIi8+XHJcblx0PC9nPlxyXG48L2c+XHJcbjwvc3ZnPmBcclxuIiwibW9kdWxlLmV4cG9ydHMgPSBgPHN2ZyB2ZXJzaW9uPVwiMS4xXCIgaWQ9XCJMYXllcl8xXCIgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHhtbG5zOnhsaW5rPVwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGlua1wiIHg9XCIwcHhcIiB5PVwiMHB4XCJcclxuXHQgdmlld0JveD1cIjAgMCAzNDguMSAzNDguMVwiIHN0eWxlPVwiZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCAzNDguMSAzNDguMTtcIiB4bWw6c3BhY2U9XCJwcmVzZXJ2ZVwiPlxyXG48Zz5cclxuICAgIDxwYXRoIGQ9XCJNMjYwLjEsNDguNjVjLTIyLDAtNDAsMTgtNDAsNDBzMTgsNDAsNDAsNDBzNDAtMTgsNDAtNDBTMjgyLjEsNDguNjUsMjYwLjEsNDguNjV6IE0yNjAuMSwxMTIuNjVjLTEzLjIsMC0yNC0xMC44LTI0LTI0XHJcbiAgICAgICAgczEwLjgtMjQsMjQtMjRzMjQsMTAuOCwyNCwyNFMyNzMuMywxMTIuNjUsMjYwLjEsMTEyLjY1elwiLz5cclxuICAgIDxwYXRoIGQ9XCJNMzA4LjEsMS4wNWgtMTA4Yy0xMC44LDAtMjAuOCw0LTI4LDExLjZMMTEuNywxNzIuMjVjLTE1LjYsMTUuNi0xNS42LDQwLjgsMCw1Ni40bDEwNy4yLDEwNi44XHJcbiAgICAgICAgYzcuNiw3LjYsMTcuNiwxMS42LDI4LjQsMTEuNnMyMC44LTQsMjguNC0xMS42bDE2MC40LTE2MC40YzcuNi03LjIsMTItMTcuMiwxMi0yNy42VjQxLjA1QzM0OC4xLDE5LjA1LDMzMC4xLDEuMDUsMzA4LjEsMS4wNXpcclxuICAgICAgICAgTTMzMi4xLDE0Ny40NWMwLDYtMi40LDEyLTcuMiwxNmwtMTYwLjgsMTYwLjhjLTQuNCw0LjQtMTAuNCw2LjgtMTYuOCw2LjhzLTEyLjQtMi40LTE2LjgtNi44TDIyLjksMjE3LjQ1XHJcbiAgICAgICAgYy05LjItOS4yLTkuMi0yNC40LDAtMzRsMTYwLjQtMTU5LjZjNC40LTQuNCwxMC40LTYuOCwxNi44LTYuOGgxMDhjMTMuMiwwLDI0LDEwLjgsMjQsMjRWMTQ3LjQ1elwiLz5cclxuPC9nPlxyXG48L3N2Zz5gXHJcbiIsIm1vZHVsZS5leHBvcnRzID0gYDxzdmcgdmVyc2lvbj1cIjEuMVwiIGlkPVwiQ2FwYV8xXCIgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHhtbG5zOnhsaW5rPVwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGlua1wiIHg9XCIwcHhcIiB5PVwiMHB4XCJcclxuXHQgdmlld0JveD1cIjAgMCA1NC45MDggNTQuOTA4XCIgc3R5bGU9XCJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDU0LjkwOCA1NC45MDg7XCIgeG1sOnNwYWNlPVwicHJlc2VydmVcIj5cclxuPGc+XHJcblx0PHBhdGggZD1cIk01NC42MTUsMTkuMTIzYy03LjI0My03LjI0NC0xNi44OS0xMS4yMzMtMjcuMTYxLTExLjIzM1M3LjUzNywxMS44NzgsMC4yOTMsMTkuMTIzYy0wLjM5MSwwLjM5MS0wLjM5MSwxLjAyMywwLDEuNDE0XHJcblx0XHRzMS4wMjMsMC4zOTEsMS40MTQsMEM4LjU3MywxMy42NywxNy43MTcsOS44ODksMjcuNDU0LDkuODg5czE4Ljg4MSwzLjc4MSwyNS43NDcsMTAuNjQ3YzAuMTk1LDAuMTk1LDAuNDUxLDAuMjkzLDAuNzA3LDAuMjkzXHJcblx0XHRzMC41MTItMC4wOTgsMC43MDctMC4yOTNDNTUuMDA2LDIwLjE0Niw1NS4wMDYsMTkuNTEzLDU0LjYxNSwxOS4xMjN6XCIvPlxyXG5cdDxwYXRoIGQ9XCJNNi4xNzEsMjVjLTAuMzkxLDAuMzkxLTAuMzkxLDEuMDIzLDAsMS40MTRjMC4xOTUsMC4xOTUsMC40NTEsMC4yOTMsMC43MDcsMC4yOTNzMC41MTItMC4wOTgsMC43MDctMC4yOTNcclxuXHRcdGMxMC45NTUtMTAuOTU2LDI4Ljc4MS0xMC45NTYsMzkuNzM3LDBjMC4zOTEsMC4zOTEsMS4wMjMsMC4zOTEsMS40MTQsMHMwLjM5MS0xLjAyMywwLTEuNDE0QzM3LjAwMiwxMy4yNjYsMTcuOTA3LDEzLjI2NCw2LjE3MSwyNVxyXG5cdFx0elwiLz5cclxuXHQ8cGF0aCBkPVwiTTI3LjQ1NCwyNC41MDhjLTUuODI1LDAtMTEuMjk1LDIuMjYzLTE1LjQwNCw2LjM3MWMtMC4zOTEsMC4zOTEtMC4zOTEsMS4wMjMsMCwxLjQxNHMxLjAyMywwLjM5MSwxLjQxNCwwXHJcblx0XHRjMy43MzEtMy43Myw4LjY5OS01Ljc4NSwxMy45OS01Ljc4NWM1LjI5MSwwLDEwLjI1OSwyLjA1NSwxMy45OSw1Ljc4NWMwLjE5NSwwLjE5NSwwLjQ1MSwwLjI5MywwLjcwNywwLjI5M1xyXG5cdFx0czAuNTEyLTAuMDk4LDAuNzA3LTAuMjkzYzAuMzkxLTAuMzkxLDAuMzkxLTEuMDIzLDAtMS40MTRDMzguNzUsMjYuNzcxLDMzLjI3OSwyNC41MDgsMjcuNDU0LDI0LjUwOHpcIi8+XHJcblx0PHBhdGggZD1cIk0yNy40NTQsMzMuOTE2Yy0zLjYxMiwwLTYuNTUxLDIuOTM5LTYuNTUxLDYuNTUyczIuOTM5LDYuNTUyLDYuNTUxLDYuNTUyYzMuNjEzLDAsNi41NTItMi45MzksNi41NTItNi41NTJcclxuXHRcdFMzMS4wNjcsMzMuOTE2LDI3LjQ1NCwzMy45MTZ6IE0yNy40NTQsNDUuMDE5Yy0yLjUxLDAtNC41NTEtMi4wNDItNC41NTEtNC41NTJzMi4wNDItNC41NTIsNC41NTEtNC41NTJzNC41NTIsMi4wNDIsNC41NTIsNC41NTJcclxuXHRcdFMyOS45NjQsNDUuMDE5LDI3LjQ1NCw0NS4wMTl6XCIvPlxyXG48L2c+XHJcbjwvc3ZnPmBcclxuIiwibW9kdWxlLmV4cG9ydHMgPSBlcnIgPT4geyBjb25zb2xlLmxvZyggZXJyLnN0YWNrIHx8IGVyciApIH1cbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuXG4gICAgRXJyb3I6IHJlcXVpcmUoJy4vTXlFcnJvcicpLFxuXG4gICAgUDogKCBmdW4sIGFyZ3M9WyBdLCB0aGlzQXJnICkgPT5cbiAgICAgICAgbmV3IFByb21pc2UoICggcmVzb2x2ZSwgcmVqZWN0ICkgPT4gUmVmbGVjdC5hcHBseSggZnVuLCB0aGlzQXJnIHx8IHRoaXMsIGFyZ3MuY29uY2F0KCAoIGUsIC4uLmNhbGxiYWNrICkgPT4gZSA/IHJlamVjdChlKSA6IHJlc29sdmUoY2FsbGJhY2spICkgKSApLFxuICAgIFxuICAgIGNvbnN0cnVjdG9yKCkgeyByZXR1cm4gdGhpcyB9XG59XG4iLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxuZnVuY3Rpb24gRXZlbnRFbWl0dGVyKCkge1xuICB0aGlzLl9ldmVudHMgPSB0aGlzLl9ldmVudHMgfHwge307XG4gIHRoaXMuX21heExpc3RlbmVycyA9IHRoaXMuX21heExpc3RlbmVycyB8fCB1bmRlZmluZWQ7XG59XG5tb2R1bGUuZXhwb3J0cyA9IEV2ZW50RW1pdHRlcjtcblxuLy8gQmFja3dhcmRzLWNvbXBhdCB3aXRoIG5vZGUgMC4xMC54XG5FdmVudEVtaXR0ZXIuRXZlbnRFbWl0dGVyID0gRXZlbnRFbWl0dGVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9ldmVudHMgPSB1bmRlZmluZWQ7XG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9tYXhMaXN0ZW5lcnMgPSB1bmRlZmluZWQ7XG5cbi8vIEJ5IGRlZmF1bHQgRXZlbnRFbWl0dGVycyB3aWxsIHByaW50IGEgd2FybmluZyBpZiBtb3JlIHRoYW4gMTAgbGlzdGVuZXJzIGFyZVxuLy8gYWRkZWQgdG8gaXQuIFRoaXMgaXMgYSB1c2VmdWwgZGVmYXVsdCB3aGljaCBoZWxwcyBmaW5kaW5nIG1lbW9yeSBsZWFrcy5cbkV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzID0gMTA7XG5cbi8vIE9idmlvdXNseSBub3QgYWxsIEVtaXR0ZXJzIHNob3VsZCBiZSBsaW1pdGVkIHRvIDEwLiBUaGlzIGZ1bmN0aW9uIGFsbG93c1xuLy8gdGhhdCB0byBiZSBpbmNyZWFzZWQuIFNldCB0byB6ZXJvIGZvciB1bmxpbWl0ZWQuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnNldE1heExpc3RlbmVycyA9IGZ1bmN0aW9uKG4pIHtcbiAgaWYgKCFpc051bWJlcihuKSB8fCBuIDwgMCB8fCBpc05hTihuKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ24gbXVzdCBiZSBhIHBvc2l0aXZlIG51bWJlcicpO1xuICB0aGlzLl9tYXhMaXN0ZW5lcnMgPSBuO1xuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIGVyLCBoYW5kbGVyLCBsZW4sIGFyZ3MsIGksIGxpc3RlbmVycztcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcblxuICAvLyBJZiB0aGVyZSBpcyBubyAnZXJyb3InIGV2ZW50IGxpc3RlbmVyIHRoZW4gdGhyb3cuXG4gIGlmICh0eXBlID09PSAnZXJyb3InKSB7XG4gICAgaWYgKCF0aGlzLl9ldmVudHMuZXJyb3IgfHxcbiAgICAgICAgKGlzT2JqZWN0KHRoaXMuX2V2ZW50cy5lcnJvcikgJiYgIXRoaXMuX2V2ZW50cy5lcnJvci5sZW5ndGgpKSB7XG4gICAgICBlciA9IGFyZ3VtZW50c1sxXTtcbiAgICAgIGlmIChlciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgIHRocm93IGVyOyAvLyBVbmhhbmRsZWQgJ2Vycm9yJyBldmVudFxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gQXQgbGVhc3QgZ2l2ZSBzb21lIGtpbmQgb2YgY29udGV4dCB0byB0aGUgdXNlclxuICAgICAgICB2YXIgZXJyID0gbmV3IEVycm9yKCdVbmNhdWdodCwgdW5zcGVjaWZpZWQgXCJlcnJvclwiIGV2ZW50LiAoJyArIGVyICsgJyknKTtcbiAgICAgICAgZXJyLmNvbnRleHQgPSBlcjtcbiAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGhhbmRsZXIgPSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgaWYgKGlzVW5kZWZpbmVkKGhhbmRsZXIpKVxuICAgIHJldHVybiBmYWxzZTtcblxuICBpZiAoaXNGdW5jdGlvbihoYW5kbGVyKSkge1xuICAgIHN3aXRjaCAoYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgLy8gZmFzdCBjYXNlc1xuICAgICAgY2FzZSAxOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAyOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcywgYXJndW1lbnRzWzFdKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDM6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0sIGFyZ3VtZW50c1syXSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgLy8gc2xvd2VyXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICAgICAgaGFuZGxlci5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoaXNPYmplY3QoaGFuZGxlcikpIHtcbiAgICBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICBsaXN0ZW5lcnMgPSBoYW5kbGVyLnNsaWNlKCk7XG4gICAgbGVuID0gbGlzdGVuZXJzLmxlbmd0aDtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuOyBpKyspXG4gICAgICBsaXN0ZW5lcnNbaV0uYXBwbHkodGhpcywgYXJncyk7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICB2YXIgbTtcblxuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgdGhpcy5fZXZlbnRzID0ge307XG5cbiAgLy8gVG8gYXZvaWQgcmVjdXJzaW9uIGluIHRoZSBjYXNlIHRoYXQgdHlwZSA9PT0gXCJuZXdMaXN0ZW5lclwiISBCZWZvcmVcbiAgLy8gYWRkaW5nIGl0IHRvIHRoZSBsaXN0ZW5lcnMsIGZpcnN0IGVtaXQgXCJuZXdMaXN0ZW5lclwiLlxuICBpZiAodGhpcy5fZXZlbnRzLm5ld0xpc3RlbmVyKVxuICAgIHRoaXMuZW1pdCgnbmV3TGlzdGVuZXInLCB0eXBlLFxuICAgICAgICAgICAgICBpc0Z1bmN0aW9uKGxpc3RlbmVyLmxpc3RlbmVyKSA/XG4gICAgICAgICAgICAgIGxpc3RlbmVyLmxpc3RlbmVyIDogbGlzdGVuZXIpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIC8vIE9wdGltaXplIHRoZSBjYXNlIG9mIG9uZSBsaXN0ZW5lci4gRG9uJ3QgbmVlZCB0aGUgZXh0cmEgYXJyYXkgb2JqZWN0LlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXSA9IGxpc3RlbmVyO1xuICBlbHNlIGlmIChpc09iamVjdCh0aGlzLl9ldmVudHNbdHlwZV0pKVxuICAgIC8vIElmIHdlJ3ZlIGFscmVhZHkgZ290IGFuIGFycmF5LCBqdXN0IGFwcGVuZC5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0ucHVzaChsaXN0ZW5lcik7XG4gIGVsc2VcbiAgICAvLyBBZGRpbmcgdGhlIHNlY29uZCBlbGVtZW50LCBuZWVkIHRvIGNoYW5nZSB0byBhcnJheS5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0gPSBbdGhpcy5fZXZlbnRzW3R5cGVdLCBsaXN0ZW5lcl07XG5cbiAgLy8gQ2hlY2sgZm9yIGxpc3RlbmVyIGxlYWtcbiAgaWYgKGlzT2JqZWN0KHRoaXMuX2V2ZW50c1t0eXBlXSkgJiYgIXRoaXMuX2V2ZW50c1t0eXBlXS53YXJuZWQpIHtcbiAgICBpZiAoIWlzVW5kZWZpbmVkKHRoaXMuX21heExpc3RlbmVycykpIHtcbiAgICAgIG0gPSB0aGlzLl9tYXhMaXN0ZW5lcnM7XG4gICAgfSBlbHNlIHtcbiAgICAgIG0gPSBFdmVudEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycztcbiAgICB9XG5cbiAgICBpZiAobSAmJiBtID4gMCAmJiB0aGlzLl9ldmVudHNbdHlwZV0ubGVuZ3RoID4gbSkge1xuICAgICAgdGhpcy5fZXZlbnRzW3R5cGVdLndhcm5lZCA9IHRydWU7XG4gICAgICBjb25zb2xlLmVycm9yKCcobm9kZSkgd2FybmluZzogcG9zc2libGUgRXZlbnRFbWl0dGVyIG1lbW9yeSAnICtcbiAgICAgICAgICAgICAgICAgICAgJ2xlYWsgZGV0ZWN0ZWQuICVkIGxpc3RlbmVycyBhZGRlZC4gJyArXG4gICAgICAgICAgICAgICAgICAgICdVc2UgZW1pdHRlci5zZXRNYXhMaXN0ZW5lcnMoKSB0byBpbmNyZWFzZSBsaW1pdC4nLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9ldmVudHNbdHlwZV0ubGVuZ3RoKTtcbiAgICAgIGlmICh0eXBlb2YgY29uc29sZS50cmFjZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAvLyBub3Qgc3VwcG9ydGVkIGluIElFIDEwXG4gICAgICAgIGNvbnNvbGUudHJhY2UoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub24gPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgdmFyIGZpcmVkID0gZmFsc2U7XG5cbiAgZnVuY3Rpb24gZygpIHtcbiAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGcpO1xuXG4gICAgaWYgKCFmaXJlZCkge1xuICAgICAgZmlyZWQgPSB0cnVlO1xuICAgICAgbGlzdGVuZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG4gIH1cblxuICBnLmxpc3RlbmVyID0gbGlzdGVuZXI7XG4gIHRoaXMub24odHlwZSwgZyk7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vLyBlbWl0cyBhICdyZW1vdmVMaXN0ZW5lcicgZXZlbnQgaWZmIHRoZSBsaXN0ZW5lciB3YXMgcmVtb3ZlZFxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIHZhciBsaXN0LCBwb3NpdGlvbiwgbGVuZ3RoLCBpO1xuXG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIHJldHVybiB0aGlzO1xuXG4gIGxpc3QgPSB0aGlzLl9ldmVudHNbdHlwZV07XG4gIGxlbmd0aCA9IGxpc3QubGVuZ3RoO1xuICBwb3NpdGlvbiA9IC0xO1xuXG4gIGlmIChsaXN0ID09PSBsaXN0ZW5lciB8fFxuICAgICAgKGlzRnVuY3Rpb24obGlzdC5saXN0ZW5lcikgJiYgbGlzdC5saXN0ZW5lciA9PT0gbGlzdGVuZXIpKSB7XG4gICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICBpZiAodGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKVxuICAgICAgdGhpcy5lbWl0KCdyZW1vdmVMaXN0ZW5lcicsIHR5cGUsIGxpc3RlbmVyKTtcblxuICB9IGVsc2UgaWYgKGlzT2JqZWN0KGxpc3QpKSB7XG4gICAgZm9yIChpID0gbGVuZ3RoOyBpLS0gPiAwOykge1xuICAgICAgaWYgKGxpc3RbaV0gPT09IGxpc3RlbmVyIHx8XG4gICAgICAgICAgKGxpc3RbaV0ubGlzdGVuZXIgJiYgbGlzdFtpXS5saXN0ZW5lciA9PT0gbGlzdGVuZXIpKSB7XG4gICAgICAgIHBvc2l0aW9uID0gaTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHBvc2l0aW9uIDwgMClcbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgaWYgKGxpc3QubGVuZ3RoID09PSAxKSB7XG4gICAgICBsaXN0Lmxlbmd0aCA9IDA7XG4gICAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIH0gZWxzZSB7XG4gICAgICBsaXN0LnNwbGljZShwb3NpdGlvbiwgMSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcilcbiAgICAgIHRoaXMuZW1pdCgncmVtb3ZlTGlzdGVuZXInLCB0eXBlLCBsaXN0ZW5lcik7XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlQWxsTGlzdGVuZXJzID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIga2V5LCBsaXN0ZW5lcnM7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgcmV0dXJuIHRoaXM7XG5cbiAgLy8gbm90IGxpc3RlbmluZyBmb3IgcmVtb3ZlTGlzdGVuZXIsIG5vIG5lZWQgdG8gZW1pdFxuICBpZiAoIXRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcikge1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKVxuICAgICAgdGhpcy5fZXZlbnRzID0ge307XG4gICAgZWxzZSBpZiAodGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIGVtaXQgcmVtb3ZlTGlzdGVuZXIgZm9yIGFsbCBsaXN0ZW5lcnMgb24gYWxsIGV2ZW50c1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgIGZvciAoa2V5IGluIHRoaXMuX2V2ZW50cykge1xuICAgICAgaWYgKGtleSA9PT0gJ3JlbW92ZUxpc3RlbmVyJykgY29udGludWU7XG4gICAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycyhrZXkpO1xuICAgIH1cbiAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycygncmVtb3ZlTGlzdGVuZXInKTtcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGxpc3RlbmVycyA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICBpZiAoaXNGdW5jdGlvbihsaXN0ZW5lcnMpKSB7XG4gICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcnMpO1xuICB9IGVsc2UgaWYgKGxpc3RlbmVycykge1xuICAgIC8vIExJRk8gb3JkZXJcbiAgICB3aGlsZSAobGlzdGVuZXJzLmxlbmd0aClcbiAgICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXJzW2xpc3RlbmVycy5sZW5ndGggLSAxXSk7XG4gIH1cbiAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJzID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIgcmV0O1xuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIHJldCA9IFtdO1xuICBlbHNlIGlmIChpc0Z1bmN0aW9uKHRoaXMuX2V2ZW50c1t0eXBlXSkpXG4gICAgcmV0ID0gW3RoaXMuX2V2ZW50c1t0eXBlXV07XG4gIGVsc2VcbiAgICByZXQgPSB0aGlzLl9ldmVudHNbdHlwZV0uc2xpY2UoKTtcbiAgcmV0dXJuIHJldDtcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJDb3VudCA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgaWYgKHRoaXMuX2V2ZW50cykge1xuICAgIHZhciBldmxpc3RlbmVyID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gICAgaWYgKGlzRnVuY3Rpb24oZXZsaXN0ZW5lcikpXG4gICAgICByZXR1cm4gMTtcbiAgICBlbHNlIGlmIChldmxpc3RlbmVyKVxuICAgICAgcmV0dXJuIGV2bGlzdGVuZXIubGVuZ3RoO1xuICB9XG4gIHJldHVybiAwO1xufTtcblxuRXZlbnRFbWl0dGVyLmxpc3RlbmVyQ291bnQgPSBmdW5jdGlvbihlbWl0dGVyLCB0eXBlKSB7XG4gIHJldHVybiBlbWl0dGVyLmxpc3RlbmVyQ291bnQodHlwZSk7XG59O1xuXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ2Z1bmN0aW9uJztcbn1cblxuZnVuY3Rpb24gaXNOdW1iZXIoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnbnVtYmVyJztcbn1cblxuZnVuY3Rpb24gaXNPYmplY3QoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnb2JqZWN0JyAmJiBhcmcgIT09IG51bGw7XG59XG5cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09PSB2b2lkIDA7XG59XG4iXX0=
