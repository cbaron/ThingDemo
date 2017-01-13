(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

module.exports = {
	Firehose: require('./views/templates/Firehose'),
	Geo: require('./views/templates/Geo'),
	Header: require('./views/templates/Header'),
	Home: require('./views/templates/Home'),
	Overview: require('./views/templates/Overview'),
	Sidebar: require('./views/templates/Sidebar')
};

},{"./views/templates/Firehose":16,"./views/templates/Geo":17,"./views/templates/Header":18,"./views/templates/Home":19,"./views/templates/Overview":20,"./views/templates/Sidebar":21}],2:[function(require,module,exports){
'use strict';

module.exports = {
	Firehose: require('./views/Firehose'),
	Geo: require('./views/Geo'),
	Header: require('./views/Header'),
	Home: require('./views/Home'),
	Overview: require('./views/Overview'),
	Sidebar: require('./views/Sidebar')
};

},{"./views/Firehose":8,"./views/Geo":9,"./views/Header":10,"./views/Home":11,"./views/Overview":12,"./views/Sidebar":13}],3:[function(require,module,exports){
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

},{"../../lib/MyObject":26}],4:[function(require,module,exports){
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

},{"../../lib/MyError":25,"./.ViewMap":2,"./factory/View":4}],8:[function(require,module,exports){
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

},{"./__proto__":14}],9:[function(require,module,exports){
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

},{"./__proto__":14}],10:[function(require,module,exports){
'use strict';

module.exports = Object.assign({}, require('./__proto__'), {});

},{"./__proto__":14}],11:[function(require,module,exports){
'use strict';

module.exports = Object.assign({}, require('./__proto__'), {
    handleSidebarClick: function handleSidebarClick(name) {
        if (this.views[name]) return this.views[name].show();

        this.views[name] = this.factory.create(name, Object.assign({ insertion: { value: { el: this.els.main } } }));
    },
    postRender: function postRender() {
        this.views.sidebar.on('clicked', this.handleSidebarClick.bind(this));
        return this;
    },
    size: function size() {
        //this.views.firehose.els.container.style.height = `${this.els.container.clientHeight - this.views.header.els.container.clientHeight}px`
        return true;
    }
});

},{"./__proto__":14}],12:[function(require,module,exports){
'use strict';

module.exports = Object.assign({}, require('./__proto__'), {});

},{"./__proto__":14}],13:[function(require,module,exports){
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

},{"./__proto__":14,"./templates/lib/dollar":22,"./templates/lib/home":23,"./templates/lib/location":24}],14:[function(require,module,exports){
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

},{"../../../lib/MyObject":26,"../Xhr":3,"./lib/OptimizedResize":15,"events":27}],15:[function(require,module,exports){
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

},{}],16:[function(require,module,exports){
"use strict";

module.exports = function (p) {
  return "<div id=\"viz\"></div>";
};

},{}],17:[function(require,module,exports){
"use strict";

module.exports = function (p) {
  return "<div></div>";
};

},{}],18:[function(require,module,exports){
"use strict";

module.exports = function (p) {
    return "<div>\n    <span>China Unicom</span>\n    <div>\n        <input data-js=\"from\" type=\"text\" />\n        <span>to</span>\n        <input data-js=\"to\" type=\"text\" />\n    </div>\n</div>";
};

},{}],19:[function(require,module,exports){
"use strict";

module.exports = function (p) {
    return "<div class=\"cleafix\">\n    <div data-view=\"sidebar\"></div>\n    <div data-js=\"main\" class=\"main\"></div>\n</div>";
};

},{}],20:[function(require,module,exports){
"use strict";

module.exports = function (p) {
    return "<div>\n    <div class=\"header\">\n        <span>Overview</span>\n        <span>Overview</span>\n    </div>\n</div>";
};

},{}],21:[function(require,module,exports){
'use strict';

module.exports = function (p) {
    var list = p.map(function (item) {
        return '<li data-name="' + item.name + '" class="clearfix">' + item.icon + '<span class="label">' + item.label + '</span></li>';
    }).join('');
    return '<div>\n        <div data-js="header" class="header">\n            <img class="logo" src="/static/img/logo.png"/>\n        </div>\n        <ul data-js="list">' + list + '</ul>\n    </div>';
};

},{}],22:[function(require,module,exports){
"use strict";

module.exports = "<svg version=\"1.1\" id=\"Capa_1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\"\n\t width=\"611.994px\" height=\"611.994px\" viewBox=\"0 0 611.994 611.994\" style=\"enable-background:new 0 0 611.994 611.994;\"\n\t xml:space=\"preserve\">\n<g>\n    <path d=\"M306.009,481.303c-55.595,0-100.833-42.621-100.833-95.004c0-8.122,6.581-14.703,14.703-14.703\n        s14.703,6.581,14.703,14.703c0,36.169,32.041,65.6,71.427,65.6s71.415-29.431,71.415-65.6c0-36.17-32.035-65.599-71.415-65.599\n        c-55.595,0-100.833-42.621-100.833-95.004c0-52.384,45.238-95.004,100.833-95.004c29.854,0,57.988,12.351,77.196,33.887\n        c5.404,6.063,4.869,15.355-1.188,20.76c-6.058,5.411-15.354,4.87-20.76-1.188c-13.627-15.285-33.764-24.054-55.248-24.054\n        c-39.38,0-71.427,29.423-71.427,65.599c0,36.169,32.041,65.598,71.427,65.598c55.596,0,100.821,42.621,100.821,95.005\n        C406.836,438.682,361.604,481.303,306.009,481.303z\"/>\n    <path d=\"M303.315,525.235c-8.122,0-14.703-6.581-14.703-14.703v-409.07c0-8.122,6.581-14.703,14.703-14.703\n        c8.123,0,14.703,6.581,14.703,14.703v409.07C318.019,518.654,311.438,525.235,303.315,525.235z\"/>\n</g>\n</svg>";

},{}],23:[function(require,module,exports){
"use strict";

module.exports = "<svg version=\"1.1\" id=\"Capa_1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\"\n\t viewBox=\"0 0 58.365 58.365\" style=\"enable-background:new 0 0 58.365 58.365;\" xml:space=\"preserve\">\n<path d=\"M57.863,26.632l-8.681-8.061V5.365h-10v3.921L29.182,0L0.502,26.632c-0.404,0.376-0.428,1.009-0.052,1.414\n\tc0.375,0.404,1.008,0.427,1.414,0.052l3.319-3.082v33.349h16h16h16V25.015l3.319,3.082c0.192,0.179,0.437,0.267,0.681,0.267\n\tc0.269,0,0.536-0.107,0.732-0.319C58.291,27.641,58.267,27.008,57.863,26.632z M41.182,7.365h6v9.349l-6-5.571V7.365z\n\t M23.182,56.365V35.302c0-0.517,0.42-0.937,0.937-0.937h10.126c0.517,0,0.937,0.42,0.937,0.937v21.063H23.182z M51.182,56.365h-14\n\tV35.302c0-1.62-1.317-2.937-2.937-2.937H24.119c-1.62,0-2.937,1.317-2.937,2.937v21.063h-14V23.158l22-20.429l14.28,13.26\n\tl5.72,5.311v0l2,1.857V56.365z\"/>\n</svg>";

},{}],24:[function(require,module,exports){
"use strict";

module.exports = "\n<svg version=\"1.1\" id=\"Capa_1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\"\n\t width=\"491.582px\" height=\"491.582px\" viewBox=\"0 0 491.582 491.582\" style=\"enable-background:new 0 0 491.582 491.582;\"\n\t xml:space=\"preserve\">\n<g>\n\t<g>\n\t\t<path d=\"M245.791,0C153.799,0,78.957,74.841,78.957,166.833c0,36.967,21.764,93.187,68.493,176.926\n\t\t\tc31.887,57.138,63.627,105.4,64.966,107.433l22.941,34.773c2.313,3.507,6.232,5.617,10.434,5.617s8.121-2.11,10.434-5.617\n\t\t\tl22.94-34.771c1.326-2.01,32.835-49.855,64.967-107.435c46.729-83.735,68.493-139.955,68.493-176.926\n\t\t\tC412.625,74.841,337.783,0,245.791,0z M322.302,331.576c-31.685,56.775-62.696,103.869-64.003,105.848l-12.508,18.959\n\t\t\tl-12.504-18.954c-1.314-1.995-32.563-49.511-64.007-105.853c-43.345-77.676-65.323-133.104-65.323-164.743\n\t\t\tC103.957,88.626,167.583,25,245.791,25s141.834,63.626,141.834,141.833C387.625,198.476,365.647,253.902,322.302,331.576z\"/>\n\t\t<path d=\"M245.791,73.291c-51.005,0-92.5,41.496-92.5,92.5s41.495,92.5,92.5,92.5s92.5-41.496,92.5-92.5\n\t\t\tS296.796,73.291,245.791,73.291z M245.791,233.291c-37.22,0-67.5-30.28-67.5-67.5s30.28-67.5,67.5-67.5\n\t\t\tc37.221,0,67.5,30.28,67.5,67.5S283.012,233.291,245.791,233.291z\"/>\n\t</g>\n</g>\n</svg>";

},{}],25:[function(require,module,exports){
"use strict";

module.exports = function (err) {
  console.log(err.stack || err);
};

},{}],26:[function(require,module,exports){
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

},{"./MyError":25}],27:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjbGllbnQvanMvLlRlbXBsYXRlTWFwLmpzIiwiY2xpZW50L2pzLy5WaWV3TWFwLmpzIiwiY2xpZW50L2pzL1hoci5qcyIsImNsaWVudC9qcy9mYWN0b3J5L1ZpZXcuanMiLCJjbGllbnQvanMvbWFpbi5qcyIsImNsaWVudC9qcy9wb2x5ZmlsbC5qcyIsImNsaWVudC9qcy9yb3V0ZXIuanMiLCJjbGllbnQvanMvdmlld3MvRmlyZWhvc2UuanMiLCJjbGllbnQvanMvdmlld3MvR2VvLmpzIiwiY2xpZW50L2pzL3ZpZXdzL0hlYWRlci5qcyIsImNsaWVudC9qcy92aWV3cy9Ib21lLmpzIiwiY2xpZW50L2pzL3ZpZXdzL092ZXJ2aWV3LmpzIiwiY2xpZW50L2pzL3ZpZXdzL1NpZGViYXIuanMiLCJjbGllbnQvanMvdmlld3MvX19wcm90b19fLmpzIiwiY2xpZW50L2pzL3ZpZXdzL2xpYi9PcHRpbWl6ZWRSZXNpemUuanMiLCJjbGllbnQvanMvdmlld3MvdGVtcGxhdGVzL0ZpcmVob3NlLmpzIiwiY2xpZW50L2pzL3ZpZXdzL3RlbXBsYXRlcy9HZW8uanMiLCJjbGllbnQvanMvdmlld3MvdGVtcGxhdGVzL0hlYWRlci5qcyIsImNsaWVudC9qcy92aWV3cy90ZW1wbGF0ZXMvSG9tZS5qcyIsImNsaWVudC9qcy92aWV3cy90ZW1wbGF0ZXMvT3ZlcnZpZXcuanMiLCJjbGllbnQvanMvdmlld3MvdGVtcGxhdGVzL1NpZGViYXIuanMiLCJjbGllbnQvanMvdmlld3MvdGVtcGxhdGVzL2xpYi9kb2xsYXIuanMiLCJjbGllbnQvanMvdmlld3MvdGVtcGxhdGVzL2xpYi9ob21lLmpzIiwiY2xpZW50L2pzL3ZpZXdzL3RlbXBsYXRlcy9saWIvbG9jYXRpb24uanMiLCJsaWIvTXlFcnJvci5qcyIsImxpYi9NeU9iamVjdC5qcyIsIm5vZGVfbW9kdWxlcy9ldmVudHMvZXZlbnRzLmpzIl0sIm5hbWVzIjpb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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIm1vZHVsZS5leHBvcnRzPXtcblx0RmlyZWhvc2U6IHJlcXVpcmUoJy4vdmlld3MvdGVtcGxhdGVzL0ZpcmVob3NlJyksXG5cdEdlbzogcmVxdWlyZSgnLi92aWV3cy90ZW1wbGF0ZXMvR2VvJyksXG5cdEhlYWRlcjogcmVxdWlyZSgnLi92aWV3cy90ZW1wbGF0ZXMvSGVhZGVyJyksXG5cdEhvbWU6IHJlcXVpcmUoJy4vdmlld3MvdGVtcGxhdGVzL0hvbWUnKSxcblx0T3ZlcnZpZXc6IHJlcXVpcmUoJy4vdmlld3MvdGVtcGxhdGVzL092ZXJ2aWV3JyksXG5cdFNpZGViYXI6IHJlcXVpcmUoJy4vdmlld3MvdGVtcGxhdGVzL1NpZGViYXInKVxufSIsIm1vZHVsZS5leHBvcnRzPXtcblx0RmlyZWhvc2U6IHJlcXVpcmUoJy4vdmlld3MvRmlyZWhvc2UnKSxcblx0R2VvOiByZXF1aXJlKCcuL3ZpZXdzL0dlbycpLFxuXHRIZWFkZXI6IHJlcXVpcmUoJy4vdmlld3MvSGVhZGVyJyksXG5cdEhvbWU6IHJlcXVpcmUoJy4vdmlld3MvSG9tZScpLFxuXHRPdmVydmlldzogcmVxdWlyZSgnLi92aWV3cy9PdmVydmlldycpLFxuXHRTaWRlYmFyOiByZXF1aXJlKCcuL3ZpZXdzL1NpZGViYXInKVxufSIsIm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmNyZWF0ZSggT2JqZWN0LmFzc2lnbigge30sIHJlcXVpcmUoJy4uLy4uL2xpYi9NeU9iamVjdCcpLCB7XG5cbiAgICBSZXF1ZXN0OiB7XG5cbiAgICAgICAgY29uc3RydWN0b3IoIGRhdGEgKSB7XG4gICAgICAgICAgICBsZXQgcmVxID0gbmV3IFhNTEh0dHBSZXF1ZXN0KClcblxuICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKCAoIHJlc29sdmUsIHJlamVjdCApID0+IHtcblxuICAgICAgICAgICAgICAgIHJlcS5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgWyA1MDAsIDQwNCwgNDAxIF0uaW5jbHVkZXMoIHRoaXMuc3RhdHVzIClcbiAgICAgICAgICAgICAgICAgICAgICAgID8gcmVqZWN0KCB0aGlzLnJlc3BvbnNlIClcbiAgICAgICAgICAgICAgICAgICAgICAgIDogcmVzb2x2ZSggSlNPTi5wYXJzZSh0aGlzLnJlc3BvbnNlKSApXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYoIGRhdGEubWV0aG9kID09PSBcImdldFwiIHx8IGRhdGEubWV0aG9kID09PSBcIm9wdGlvbnNcIiApIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHFzID0gZGF0YS5xcyA/IGA/JHtkYXRhLnFzfWAgOiAnJyBcbiAgICAgICAgICAgICAgICAgICAgcmVxLm9wZW4oIGRhdGEubWV0aG9kLCBgLyR7ZGF0YS5yZXNvdXJjZX0ke3FzfWAgKVxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldEhlYWRlcnMoIHJlcSwgZGF0YS5oZWFkZXJzIClcbiAgICAgICAgICAgICAgICAgICAgcmVxLnNlbmQobnVsbClcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXEub3BlbiggZGF0YS5tZXRob2QsIGAvJHtkYXRhLnJlc291cmNlfWAsIHRydWUpXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0SGVhZGVycyggcmVxLCBkYXRhLmhlYWRlcnMgKVxuICAgICAgICAgICAgICAgICAgICByZXEuc2VuZCggZGF0YS5kYXRhIClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IClcbiAgICAgICAgfSxcblxuICAgICAgICBwbGFpbkVzY2FwZSggc1RleHQgKSB7XG4gICAgICAgICAgICAvKiBob3cgc2hvdWxkIEkgdHJlYXQgYSB0ZXh0L3BsYWluIGZvcm0gZW5jb2Rpbmc/IHdoYXQgY2hhcmFjdGVycyBhcmUgbm90IGFsbG93ZWQ/IHRoaXMgaXMgd2hhdCBJIHN1cHBvc2UuLi46ICovXG4gICAgICAgICAgICAvKiBcIjRcXDNcXDcgLSBFaW5zdGVpbiBzYWlkIEU9bWMyXCIgLS0tLT4gXCI0XFxcXDNcXFxcN1xcIC1cXCBFaW5zdGVpblxcIHNhaWRcXCBFXFw9bWMyXCIgKi9cbiAgICAgICAgICAgIHJldHVybiBzVGV4dC5yZXBsYWNlKC9bXFxzXFw9XFxcXF0vZywgXCJcXFxcJCZcIik7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2V0SGVhZGVycyggcmVxLCBoZWFkZXJzPXt9ICkge1xuICAgICAgICAgICAgcmVxLnNldFJlcXVlc3RIZWFkZXIoIFwiQWNjZXB0XCIsIGhlYWRlcnMuYWNjZXB0IHx8ICdhcHBsaWNhdGlvbi9qc29uJyApXG4gICAgICAgICAgICByZXEuc2V0UmVxdWVzdEhlYWRlciggXCJDb250ZW50LVR5cGVcIiwgaGVhZGVycy5jb250ZW50VHlwZSB8fCAndGV4dC9wbGFpbicgKVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIF9mYWN0b3J5KCBkYXRhICkge1xuICAgICAgICByZXR1cm4gT2JqZWN0LmNyZWF0ZSggdGhpcy5SZXF1ZXN0LCB7IH0gKS5jb25zdHJ1Y3RvciggZGF0YSApXG4gICAgfSxcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuXG4gICAgICAgIGlmKCAhWE1MSHR0cFJlcXVlc3QucHJvdG90eXBlLnNlbmRBc0JpbmFyeSApIHtcbiAgICAgICAgICBYTUxIdHRwUmVxdWVzdC5wcm90b3R5cGUuc2VuZEFzQmluYXJ5ID0gZnVuY3Rpb24oc0RhdGEpIHtcbiAgICAgICAgICAgIHZhciBuQnl0ZXMgPSBzRGF0YS5sZW5ndGgsIHVpOERhdGEgPSBuZXcgVWludDhBcnJheShuQnl0ZXMpO1xuICAgICAgICAgICAgZm9yICh2YXIgbklkeCA9IDA7IG5JZHggPCBuQnl0ZXM7IG5JZHgrKykge1xuICAgICAgICAgICAgICB1aThEYXRhW25JZHhdID0gc0RhdGEuY2hhckNvZGVBdChuSWR4KSAmIDB4ZmY7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnNlbmQodWk4RGF0YSk7XG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLl9mYWN0b3J5LmJpbmQodGhpcylcbiAgICB9XG5cbn0gKSwgeyB9ICkuY29uc3RydWN0b3IoKVxuIiwibW9kdWxlLmV4cG9ydHMgPSBPYmplY3QuY3JlYXRlKCB7XG5cbiAgICBjcmVhdGUoIG5hbWUsIG9wdHMgKSB7XG4gICAgICAgIGNvbnN0IGxvd2VyID0gbmFtZVxuICAgICAgICBuYW1lID0gbmFtZS5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIG5hbWUuc2xpY2UoMSlcbiAgICAgICAgcmV0dXJuIE9iamVjdC5jcmVhdGUoXG4gICAgICAgICAgICB0aGlzLlZpZXdzWyBuYW1lIF0sXG4gICAgICAgICAgICBPYmplY3QuYXNzaWduKCB7XG4gICAgICAgICAgICAgICAgbmFtZTogeyB2YWx1ZTogbmFtZSB9LFxuICAgICAgICAgICAgICAgIGZhY3Rvcnk6IHsgdmFsdWU6IHRoaXMgfSxcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogeyB2YWx1ZTogdGhpcy5UZW1wbGF0ZXNbIG5hbWUgXSB9LFxuICAgICAgICAgICAgICAgIHVzZXI6IHsgdmFsdWU6IHRoaXMuVXNlciB9LFxuICAgICAgICAgICAgICAgIFZpZXdzOiB7IHZhbHVlOiB7IH0gfVxuICAgICAgICAgICAgICAgIH0sIG9wdHMgKVxuICAgICAgICApLmNvbnN0cnVjdG9yKClcbiAgICAgICAgLm9uKCAnbmF2aWdhdGUnLCByb3V0ZSA9PiByZXF1aXJlKCcuLi9yb3V0ZXInKS5uYXZpZ2F0ZSggcm91dGUgKSApXG4gICAgICAgIC5vbiggJ2RlbGV0ZWQnLCAoKSA9PiBkZWxldGUgKHJlcXVpcmUoJy4uL3JvdXRlcicpKS52aWV3c1tsb3dlcl0gKVxuICAgIH0sXG5cbn0sIHtcbiAgICBUZW1wbGF0ZXM6IHsgdmFsdWU6IHJlcXVpcmUoJy4uLy5UZW1wbGF0ZU1hcCcpIH0sXG4gICAgVmlld3M6IHsgdmFsdWU6IHJlcXVpcmUoJy4uLy5WaWV3TWFwJykgfVxufSApXG4iLCJyZXF1aXJlKCcuL3BvbHlmaWxsJylcbndpbmRvdy5pbml0TWFwID0gKCkgPT4gdHJ1ZVxud2luZG93Lm9ubG9hZCA9ICgpID0+IHJlcXVpcmUoJy4vcm91dGVyJylcbiIsIi8vaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL0VsZW1lbnQvY2xvc2VzdFxuaWYgKHdpbmRvdy5FbGVtZW50ICYmICFFbGVtZW50LnByb3RvdHlwZS5jbG9zZXN0KSB7XG4gICAgRWxlbWVudC5wcm90b3R5cGUuY2xvc2VzdCA9IFxuICAgIGZ1bmN0aW9uKHMpIHtcbiAgICAgICAgdmFyIG1hdGNoZXMgPSAodGhpcy5kb2N1bWVudCB8fCB0aGlzLm93bmVyRG9jdW1lbnQpLnF1ZXJ5U2VsZWN0b3JBbGwocyksXG4gICAgICAgICAgICBpLFxuICAgICAgICAgICAgZWwgPSB0aGlzO1xuICAgICAgICBkbyB7XG4gICAgICAgICAgICBpID0gbWF0Y2hlcy5sZW5ndGg7XG4gICAgICAgICAgICB3aGlsZSAoLS1pID49IDAgJiYgbWF0Y2hlcy5pdGVtKGkpICE9PSBlbCkge307XG4gICAgICAgIH0gd2hpbGUgKChpIDwgMCkgJiYgKGVsID0gZWwucGFyZW50RWxlbWVudCkpOyBcbiAgICAgICAgcmV0dXJuIGVsO1xuICAgIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gdHJ1ZVxuIiwibW9kdWxlLmV4cG9ydHMgPSBPYmplY3QuY3JlYXRlKCB7XG5cbiAgICBFcnJvcjogcmVxdWlyZSgnLi4vLi4vbGliL015RXJyb3InKSxcbiAgICBcbiAgICBWaWV3RmFjdG9yeTogcmVxdWlyZSgnLi9mYWN0b3J5L1ZpZXcnKSxcbiAgICBcbiAgICBWaWV3czogcmVxdWlyZSgnLi8uVmlld01hcCcpLFxuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuY29udGVudENvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNjb250ZW50JylcblxuICAgICAgICB3aW5kb3cub25wb3BzdGF0ZSA9IHRoaXMuaGFuZGxlLmJpbmQodGhpcylcblxuICAgICAgICB0aGlzLmhhbmRsZSgpXG5cbiAgICAgICAgcmV0dXJuIHRoaXNcbiAgICB9LFxuXG4gICAgaGFuZGxlKCkge1xuICAgICAgICB0aGlzLmhhbmRsZXIoIHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5zcGxpdCgnLycpLnNsaWNlKDEpIClcbiAgICB9LFxuXG4gICAgaGFuZGxlciggcGF0aCApIHtcbiAgICAgICAgY29uc3QgdmlldyA9IHRoaXMuVmlld3NbIHBhdGhbMF0gXSA/IHBhdGhbMF0gOiAnaG9tZSc7XG5cbiAgICAgICAgKCAoIHZpZXcgPT09IHRoaXMuY3VycmVudFZpZXcgKVxuICAgICAgICAgICAgPyBQcm9taXNlLnJlc29sdmUoKVxuICAgICAgICAgICAgOiBQcm9taXNlLmFsbCggT2JqZWN0LmtleXMoIHRoaXMudmlld3MgKS5tYXAoIHZpZXcgPT4gdGhpcy52aWV3c1sgdmlldyBdLmhpZGUoKSApICkgKSBcbiAgICAgICAgLnRoZW4oICgpID0+IHtcblxuICAgICAgICAgICAgdGhpcy5jdXJyZW50VmlldyA9IHZpZXdcblxuICAgICAgICAgICAgaWYoIHRoaXMudmlld3NbIHZpZXcgXSApIHJldHVybiB0aGlzLnZpZXdzWyB2aWV3IF0ub25OYXZpZ2F0aW9uKCBwYXRoIClcblxuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShcbiAgICAgICAgICAgICAgICB0aGlzLnZpZXdzWyB2aWV3IF0gPVxuICAgICAgICAgICAgICAgICAgICB0aGlzLlZpZXdGYWN0b3J5LmNyZWF0ZSggdmlldywge1xuICAgICAgICAgICAgICAgICAgICAgICAgaW5zZXJ0aW9uOiB7IHZhbHVlOiB7IGVsOiB0aGlzLmNvbnRlbnRDb250YWluZXIgfSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgcGF0aDogeyB2YWx1ZTogcGF0aCwgd3JpdGFibGU6IHRydWUgfVxuICAgICAgICAgICAgICAgICAgICB9IClcbiAgICAgICAgICAgIClcbiAgICAgICAgfSApXG4gICAgICAgIC5jYXRjaCggdGhpcy5FcnJvciApXG4gICAgfSxcblxuICAgIG5hdmlnYXRlKCBsb2NhdGlvbiApIHtcbiAgICAgICAgaGlzdG9yeS5wdXNoU3RhdGUoIHt9LCAnJywgbG9jYXRpb24gKVxuICAgICAgICB0aGlzLmhhbmRsZSgpXG4gICAgfVxuXG59LCB7IGN1cnJlbnRWaWV3OiB7IHZhbHVlOiAnJywgd3JpdGFibGU6IHRydWUgfSwgdmlld3M6IHsgdmFsdWU6IHsgfSB9IH0gKS5jb25zdHJ1Y3RvcigpXG4iLCJtb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5hc3NpZ24oIHt9LCByZXF1aXJlKCcuL19fcHJvdG9fXycpLCB7XG5cbiAgICAgLy9UaGlzIGNoYW5nZXMgdGhlIHNpemUgb2YgdGhlIGNvbXBvbmVudCBieSBhZGp1c3RpbmcgdGhlIHJhZGl1cyBhbmQgd2lkdGgvaGVpZ2h0O1xuICAgIGNoYW5nZVNpemUoIHcsIGggKSB7XG4gICAgICAgIHRoaXMudml6X2NvbnRhaW5lci50cmFuc2l0aW9uKCkuZHVyYXRpb24oMzAwKS5zdHlsZSgnd2lkdGgnLCB3ICsgJ3B4Jykuc3R5bGUoJ2hlaWdodCcsIGggKyAncHgnKTtcbiAgICAgICAgdGhpcy52aXoud2lkdGgodykuaGVpZ2h0KGgqLjgpLnVwZGF0ZSgpO1xuICAgIH0sXG5cbiAgICAvL1RoaXMgc2V0cyB0aGUgc2FtZSB2YWx1ZSBmb3IgZWFjaCByYWRpYWwgcHJvZ3Jlc3NcbiAgICBjaGFuZ2VEYXRhKCB2YWwgKSB7XG4gICAgICAgIHRoaXMudmFsdWVGaWVsZCA9IHRoaXMudmFsdWVGaWVsZHNbIE51bWJlcih2YWwpIF07XG4gICAgICAgIHRoaXMudml6LnVwZGF0ZSgpO1xuICAgIH0sXG5cbiAgICAvL1RoaXMgZnVuY3Rpb24gaXMgY2FsbGVkIHdoZW4gdGhlIHVzZXIgc2VsZWN0cyBhIGRpZmZlcmVudCBza2luLlxuICAgIGNoYW5nZVNraW4oIHZhbCApIHtcbiAgICAgICAgaWYgKHZhbCA9PSBcIk5vbmVcIikge1xuICAgICAgICAgICAgdGhpcy50aGVtZS5yZWxlYXNlKClcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMudGhlbWUudml6KHZpeilcbiAgICAgICAgICAgIHRoaXMudGhlbWUuc2tpbih2YWwpXG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnZpeigpLnVwZGF0ZSgpOyAgLy9XZSBjb3VsZCB1c2UgdGhlbWUuYXBwbHkoKSBoZXJlLCBidXQgd2Ugd2FudCB0byB0cmlnZ2VyIHRoZSB0d2Vlbi5cbiAgICB9LFxuXG4gICAgLy8gVGhpcyBmdW5jdGlvbiB1c2VzIHRoZSBhYm92ZSBodG1sIHRlbXBsYXRlIHRvIHJlcGxhY2UgdmFsdWVzIGFuZCB0aGVuIGNyZWF0ZXMgYSBuZXcgPGRpdj4gdGhhdCBpdCBhcHBlbmRzIHRvIHRoZVxuICAgIC8vIGRvY3VtZW50LmJvZHkuICBUaGlzIGlzIGp1c3Qgb25lIHdheSB5b3UgY291bGQgaW1wbGVtZW50IGEgZGF0YSB0aXAuXG4gICAgY3JlYXRlRGF0YVRpcCggeCx5LGgxLGgyLGgzICkge1xuXG4gICAgICAgIHZhciBodG1sID0gdGhpcy5kYXRhdGlwLnJlcGxhY2UoXCJIRUFERVIxXCIsIGgxKTtcbiAgICAgICAgaHRtbCA9IGh0bWwucmVwbGFjZShcIkhFQURFUjJcIiwgaDIpO1xuICAgICAgICBodG1sID0gaHRtbC5yZXBsYWNlKFwiSEVBREVSM1wiLCBoMyk7XG5cbiAgICAgICAgZDMuc2VsZWN0KFwiYm9keVwiKVxuICAgICAgICAgICAgLmFwcGVuZChcImRpdlwiKVxuICAgICAgICAgICAgLmF0dHIoXCJjbGFzc1wiLCBcInZ6LXdlaWdodGVkX3RyZWUtdGlwXCIpXG4gICAgICAgICAgICAuc3R5bGUoXCJwb3NpdGlvblwiLCBcImFic29sdXRlXCIpXG4gICAgICAgICAgICAuc3R5bGUoXCJ0b3BcIiwgeSArIFwicHhcIilcbiAgICAgICAgICAgIC5zdHlsZShcImxlZnRcIiwgKHggLSAxMjUpICsgXCJweFwiKVxuICAgICAgICAgICAgLnN0eWxlKFwib3BhY2l0eVwiLDApXG4gICAgICAgICAgICAuaHRtbChodG1sKVxuICAgICAgICAgICAgLnRyYW5zaXRpb24oKS5zdHlsZShcIm9wYWNpdHlcIiwxKTtcbiAgICB9LFxuXG4gICAgZGF0YXRpcDogYDxkaXYgY2xhc3M9XCJ0b29sdGlwXCIgc3R5bGU9XCJ3aWR0aDogMjUwcHg7IGJhY2tncm91bmQtb3BhY2l0eTouNVwiPmAgK1xuICAgICAgICAgICAgIGA8ZGl2IGNsYXNzPVwiaGVhZGVyMVwiPkhFQURFUjE8L2Rpdj5gICtcbiAgICAgICAgICAgICBgPGRpdiBjbGFzcz1cImhlYWRlci1ydWxlXCI+PC9kaXY+YCArXG4gICAgICAgICAgICAgYDxkaXYgY2xhc3M9XCJoZWFkZXIyXCI+IEhFQURFUjIgPC9kaXY+YCArXG4gICAgICAgICAgICAgYDxkaXYgY2xhc3M9XCJoZWFkZXItcnVsZVwiPjwvZGl2PmAgK1xuICAgICAgICAgICAgIGA8ZGl2IGNsYXNzPVwiaGVhZGVyM1wiPiBIRUFERVIzIDwvZGl2PmAgK1xuICAgICAgICAgICAgIGA8L2Rpdj5gLFxuXG4gICAgZm9ybWF0Q3VycmVuY3koZCkge1xuICAgICAgICBpZiAoaXNOYU4oZCkpIGQgPSAwOyByZXR1cm4gXCIkXCIgKyBkMy5mb3JtYXQoXCIsLjJmXCIpKGQpICsgXCIgQmlsbGlvblwiO1xuICAgICB9LFxuXG4gICAgaW5pdGlhbGl6ZSgpIHtcbiAgICAgICAgdGhpcy52aXogPSB2aXp1bHkudml6LndlaWdodGVkX3RyZWUoIHRoaXMuZWxzLmNvbnRhaW5lciApXG5cbiAgICAgICAgLy9IZXJlIHdlIGNyZWF0ZSB0aHJlZSB2aXp1bHkgdGhlbWVzIGZvciBlYWNoIHJhZGlhbCBwcm9ncmVzcyBjb21wb25lbnQuXG4gICAgICAgIC8vQSB0aGVtZSBtYW5hZ2VzIHRoZSBsb29rIGFuZCBmZWVsIG9mIHRoZSBjb21wb25lbnQgb3V0cHV0LiAgWW91IGNhbiBvbmx5IGhhdmVcbiAgICAgICAgLy9vbmUgY29tcG9uZW50IGFjdGl2ZSBwZXIgdGhlbWUsIHNvIHdlIGJpbmQgZWFjaCB0aGVtZSB0byB0aGUgY29ycmVzcG9uZGluZyBjb21wb25lbnQuXG4gICAgICAgIHRoaXMudGhlbWUgPVxuICAgICAgICAgICAgdml6dWx5LnRoZW1lLndlaWdodGVkX3RyZWUoIHRoaXMudml6KVxuICAgICAgICAgICAgICAgICAgICAgICAgLnNraW4odml6dWx5LnNraW4uV0VJR0hURURfVFJFRV9BWElJUylcblxuICAgICAgICAvL0xpa2UgRDMgYW5kIGpRdWVyeSwgdml6dWx5IHVzZXMgYSBmdW5jdGlvbiBjaGFpbmluZyBzeW50YXggdG8gc2V0IGNvbXBvbmVudCBwcm9wZXJ0aWVzXG4gICAgICAgIC8vSGVyZSB3ZSBzZXQgc29tZSBiYXNlcyBsaW5lIHByb3BlcnRpZXMgZm9yIGFsbCB0aHJlZSBjb21wb25lbnRzLlxuICAgICAgICB0aGlzLnZpei5kYXRhKHRoaXMuZGF0YSlcbiAgICAgICAgICAgICAgICAud2lkdGgodGhpcy5lbHMuY29udGFpbmVyLmNsaWVudFdpZHRoKSBcbiAgICAgICAgICAgICAgICAuaGVpZ2h0KHRoaXMuZWxzLmNvbnRhaW5lci5jbGllbnRIZWlnaHQpXG4gICAgICAgICAgICAgICAgLmNoaWxkcmVuKCBkID0+IGQudmFsdWVzIClcbiAgICAgICAgICAgICAgICAua2V5KCBkID0+IGQuaWQgKVxuICAgICAgICAgICAgICAgIC52YWx1ZSggZCA9PiBOdW1iZXIoIGRbIGBhZ2dfJHt0aGlzLnZhbHVlRmllbGR9YCBdICkgKVxuICAgICAgICAgICAgICAgIC5maXhlZFNwYW4oLTEpXG4gICAgICAgICAgICAgICAgLmxhYmVsKCBkID0+IHRoaXMudHJpbUxhYmVsKCBkLmtleSB8fCAoZFsgYExldmVsJHtkLmRlcHRofWAgXSApICkgKVxuICAgICAgICAgICAgICAgIC5vbiggXCJtZWFzdXJlXCIsIHRoaXMub25NZWFzdXJlLmJpbmQodGhpcykgKVxuICAgICAgICAgICAgICAgIC5vbiggXCJtb3VzZW92ZXJcIiwgdGhpcy5vbk1vdXNlT3Zlci5iaW5kKHRoaXMpIClcbiAgICAgICAgICAgICAgICAub24oIFwibW91c2VvdXRcIiwgdGhpcy5vbk1vdXNlT3V0LmJpbmQodGhpcykgKVxuICAgICAgICAgICAgICAgIC5vbiggXCJjbGlja1wiLCB0aGlzLm9uQ2xpY2suYmluZCh0aGlzKSApXG5cbiAgICAgICAgLy9XZSB1c2UgdGhpcyBmdW5jdGlvbiB0byBzaXplIHRoZSBjb21wb25lbnRzIGJhc2VkIG9uIHRoZSBzZWxlY3RlZCB2YWx1ZSBmcm9tIHRoZSBSYWRpYUxQcm9ncmVzc1Rlc3QuaHRtbCBwYWdlLlxuICAgICAgICB0aGlzLmNoYW5nZVNpemUoIHRoaXMuZWxzLmNvbnRhaW5lci5jbGllbnRXaWR0aCwgdGhpcy5lbHMuY29udGFpbmVyLmNsaWVudEhlaWdodCApXG4gICAgICAgIHRoaXMuaW5pdGlhbGl6ZWQgPSB0cnVlXG5cbiAgICAgICAgLy8gT3BlbiB1cCBzb21lIG9mIHRoZSB0cmVlIGJyYW5jaGVzLlxuICAgICAgICB0aGlzLnZpei50b2dnbGVOb2RlKHRoaXMuZGF0YS52YWx1ZXNbMl0pO1xuICAgICAgICB0aGlzLnZpei50b2dnbGVOb2RlKHRoaXMuZGF0YS52YWx1ZXNbMl0udmFsdWVzWzBdKTtcbiAgICAgICAgdGhpcy52aXoudG9nZ2xlTm9kZSh0aGlzLmRhdGEudmFsdWVzWzNdKTtcbiAgICB9LFxuXG4gICAgbG9hZERhdGEoKSB7XG4gICAgICAgIGQzLmNzdihcIi9zdGF0aWMvZGF0YS93ZWlnaHRlZHRyZWVfZmVkZXJhbF9idWRnZXQuY3N2XCIsIGNzdiA9PiB7XG4gICAgICAgICAgICB0aGlzLmRhdGEudmFsdWVzID0gdGhpcy5wcmVwRGF0YSggY3N2IClcbiAgICAgICAgICAgIHRoaXMuaW5pdGlhbGl6ZSgpXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBvbk1lYXN1cmUoKSB7XG4gICAgICAgLy8gQWxsb3dzIHlvdSB0byBtYW51YWxseSBvdmVycmlkZSB2ZXJ0aWNhbCBzcGFjaW5nXG4gICAgICAgLy8gdml6LnRyZWUoKS5ub2RlU2l6ZShbMTAwLDBdKTtcbiAgICB9LFxuXG4gICAgb25Nb3VzZU92ZXIoZSxkLGkpIHtcbiAgICAgICAgaWYgKGQgPT0gdGhpcy5kYXRhKSByZXR1cm47XG4gICAgICAgIHZhciByZWN0ID0gZS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgaWYgKGQudGFyZ2V0KSBkID0gZC50YXJnZXQ7IC8vVGhpcyBpZiBmb3IgbGluayBlbGVtZW50c1xuICAgICAgICB0aGlzLmNyZWF0ZURhdGFUaXAocmVjdC5sZWZ0LCByZWN0LnRvcCwgKGQua2V5IHx8IChkWydMZXZlbCcgKyBkLmRlcHRoXSkpLCB0aGlzLmZvcm1hdEN1cnJlbmN5KGRbXCJhZ2dfXCIgKyB0aGlzLnZhbHVlRmllbGRdKSwgdGhpcy52YWx1ZUZpZWxkKTtcbiAgICB9LFxuXG4gICAgIG9uTW91c2VPdXQoZSxkLGkpIHtcbiAgICAgICAgZDMuc2VsZWN0QWxsKFwiLnZ6LXdlaWdodGVkX3RyZWUtdGlwXCIpLnJlbW92ZSgpO1xuICAgIH0sXG5cbiAgIC8vV2UgY2FuIGNhcHR1cmUgY2xpY2sgZXZlbnRzIGFuZCByZXNwb25kIHRvIHRoZW1cbiAgICBvbkNsaWNrKGUsZCxpKSB7XG4gICAgICAgIHZpei50b2dnbGVOb2RlKGQpO1xuICAgIH0sXG5cbiAgICBwb3N0UmVuZGVyKCkge1xuICAgICAgICAvLyBodG1sIGVsZW1lbnQgdGhhdCBob2xkcyB0aGUgY2hhcnRcbiAgICAgICAgdGhpcy52aXpfY29udGFpbmVyID0gdW5kZWZpbmVkXG5cbiAgICAgICAgLy8gb3VyIHdlaWdodGVkIHRyZWVcbiAgICAgICAgdGhpcy52aXogPSB1bmRlZmluZWRcblxuICAgICAgICAvLyBvdXIgdGhlbWVcbiAgICAgICAgdGhpcy50aGVtZSA9IHVuZGVmaW5lZFxuXG4gICAgICAgIC8vIG5lc3RlZCBkYXRhXG4gICAgICAgIHRoaXMuZGF0YSA9IHt9XG5cbiAgICAgICAgLy8gc3RvcmVzIHRoZSBjdXJyZW50bHkgc2VsZWN0ZWQgdmFsdWUgZmllbGRcbiAgICAgICAgdGhpcy52YWx1ZUZpZWxkID0gXCJGZWRlcmFsXCI7XG4gICAgICAgIHRoaXMudmFsdWVGaWVsZHMgPSBbXCJGZWRlcmFsXCIsIFwiU3RhdGVcIiwgXCJMb2NhbFwiXTtcblxuICAgICAgICAvLyBTZXQgdGhlIHNpemUgb2Ygb3VyIGNvbnRhaW5lciBlbGVtZW50LlxuICAgICAgICB0aGlzLnZpel9jb250YWluZXIgPSBkMy5zZWxlY3RBbGwoXCIjdml6XCIpXG5cbiAgICAgICAgdGhpcy5sb2FkRGF0YSgpO1xuXG4gICAgICAgIHJldHVybiB0aGlzXG4gICAgfSxcblxuICAgIHByZXBEYXRhKCBjc3YgKSB7XG5cbiAgICAgICAgdmFyIHZhbHVlcz1bXTtcblxuICAgICAgICAvL0NsZWFuIGZlZGVyYWwgYnVkZ2V0IGRhdGEgYW5kIHJlbW92ZSBhbGwgcm93cyB3aGVyZSBhbGwgdmFsdWVzIGFyZSB6ZXJvIG9yIG5vIGxhYmVsc1xuICAgICAgICBjc3YuZm9yRWFjaCggZCA9PiB7XG4gICAgICAgICAgICBpZiggdGhpcy52YWx1ZUZpZWxkcy5yZWR1Y2UoICggbWVtbywgY3VyICkgPT4gbWVtbyArIE51bWJlciggZFsgY3VyIF0gKSwgMCApID4gMCApIHZhbHVlcy5wdXNoKCBkIClcbiAgICAgICAgfSApXG5cbiAgICAgICAgLy9NYWtlIG91ciBkYXRhIGludG8gYSBuZXN0ZWQgdHJlZS4gIElmIHlvdSBhbHJlYWR5IGhhdmUgYSBuZXN0ZWQgc3RydWN0dXJlIHlvdSBkb24ndCBuZWVkIHRvIGRvIHRoaXMuXG4gICAgICAgIHZhciBuZXN0ID0gZDMubmVzdCgpXG4gICAgICAgICAgICAua2V5KCBkID0+IGQuTGV2ZWwxIClcbiAgICAgICAgICAgIC5rZXkoIGQgPT4gZC5MZXZlbDIgKVxuICAgICAgICAgICAgLmtleSggZCA9PiBkLkxldmVsMyApXG4gICAgICAgICAgICAuZW50cmllcyh2YWx1ZXMpXG5cbiAgICAgICAgLy9UaGlzIHdpbGwgYmUgYSB2aXouZGF0YSBmdW5jdGlvbjtcbiAgICAgICAgdml6dWx5LmRhdGEuYWdncmVnYXRlTmVzdCggbmVzdCwgdGhpcy52YWx1ZUZpZWxkcywgKCBhLCBiICkgPT4gTnVtYmVyKGEpICsgTnVtYmVyKGIpIClcblxuICAgICAgICB2YXIgbm9kZT17fTtcbiAgICAgICAgbm9kZS52YWx1ZXMgPSBuZXN0O1xuICAgICAgICB0aGlzLnJlbW92ZUVtcHR5Tm9kZXMobm9kZSxcIjBcIixcIjBcIik7XG5cbiAgICAgICAgcmV0dXJuIG5lc3Q7XG4gICAgfSxcblxuICAgIC8vUmVtb3ZlIGVtcHR5IGNoaWxkIG5vZGVzIGxlZnQgYXQgZW5kIG9mIGFnZ3JlZ2F0aW9uIGFuZCBhZGQgdW5xaXVlIGlkc1xuICAgIHJlbW92ZUVtcHR5Tm9kZXMoIG5vZGUsIHBhcmVudElkLCBjaGlsZElkICkge1xuICAgICAgICBpZiAoIW5vZGUpIHJldHVyblxuICAgICAgICBub2RlLmlkID0gYCR7cGFyZW50SWR9XyR7Y2hpbGRJZH1gXG4gICAgICAgIGlmIChub2RlLnZhbHVlcykge1xuICAgICAgICAgICAgZm9yKHZhciBpID0gbm9kZS52YWx1ZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICAgICAgICBub2RlLmlkPXBhcmVudElkICsgXCJfXCIgKyBpO1xuICAgICAgICAgICAgICAgIGlmKCFub2RlLnZhbHVlc1tpXS5rZXkgJiYgIW5vZGUudmFsdWVzW2ldLkxldmVsNCkge1xuICAgICAgICAgICAgICAgICAgICBub2RlLnZhbHVlcy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZUVtcHR5Tm9kZXMobm9kZS52YWx1ZXNbaV0sbm9kZS5pZCxpKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBzaXplKCkge1xuICAgICAgICBpZiggdGhpcy5pbml0aWFsaXplZCApIHRoaXMuY2hhbmdlU2l6ZSggdGhpcy5lbHMuY29udGFpbmVyLmNsaWVudFdpZHRoLCB0aGlzLmVscy5jb250YWluZXIuY2xpZW50SGVpZ2h0IClcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICB9LFxuXG4gICAgdHJpbUxhYmVsIChsYWJlbCkge1xuICAgICAgIHJldHVybiAoU3RyaW5nKGxhYmVsKS5sZW5ndGggPiAyMCkgPyBTdHJpbmcobGFiZWwpLnN1YnN0cigwLCAxNykgKyBcIi4uLlwiIDogbGFiZWxcbiAgICB9XG5cbn0gKVxuIiwibW9kdWxlLmV4cG9ydHMgPSBPYmplY3QuYXNzaWduKCB7fSwgcmVxdWlyZSgnLi9fX3Byb3RvX18nKSwge1xuXG4gICAgZGF0YTogW1xuICAgICAgICB7IGxhdDogMzkuOTUwNjE0LCBsbmc6IC03NS4xOTM0ODEsIGlzT3BlbjogdHJ1ZSB9LFxuICAgICAgICB7IGxhdDogMzkuOTUwNjIwLCBsbmc6IC03NS4xOTMzOTgsIGlzT3BlbjogdHJ1ZSB9LFxuICAgICAgICB7IGxhdDogMzkuOTUwNTk1LCBsbmc6IC03NS4xOTMzMTgsIGlzT3BlbjogdHJ1ZSB9LFxuICAgICAgICB7IGxhdDogMzkuOTUwNTg1LCBsbmc6IC03NS4xOTMyNDEsIGlzT3BlbjogdHJ1ZSB9LFxuICAgICAgICB7IGxhdDogMzkuOTUwNTczLCBsbmc6IC03NS4xOTMxMzYsIGlzT3BlbjogdHJ1ZSB9LFxuICAgICAgICB7IGxhdDogMzkuOTUwNTY3LCBsbmc6IC03NS4xOTMwNTUsIGlzT3BlbjogdHJ1ZSB9LFxuICAgICAgICB7IGxhdDogMzkuOTUwNDY3LCBsbmc6IC03NS4xOTMxMjksIGlzT3BlbjogdHJ1ZSB9LFxuICAgICAgICB7IGxhdDogMzkuOTUwNDc5LCBsbmc6IC03NS4xOTMyMTksIGlzT3BlbjogdHJ1ZSB9LFxuICAgICAgICB7IGxhdDogMzkuOTUwNDg2LCBsbmc6IC03NS4xOTMyNzAsIGlzT3BlbjogdHJ1ZSB9LFxuICAgICAgICB7IGxhdDogMzkuOTUwNDkyLCBsbmc6IC03NS4xOTMzMTgsIGlzT3BlbjogdHJ1ZSB9LFxuICAgICAgICB7IGxhdDogMzkuOTUwNDk5LCBsbmc6IC03NS4xOTMzODgsIGlzT3BlbjogdHJ1ZSB9LFxuICAgICAgICB7IGxhdDogMzkuOTUwNTEyLCBsbmc6IC03NS4xOTM0NzksIGlzT3BlbjogdHJ1ZSB9LFxuICAgICAgICB7IGxhdDogMzkuOTUwNTIzLCBsbmc6IC03NS4xOTM1NjUsIGlzT3BlbjogdHJ1ZSB9LFxuICAgICAgICB7IGxhdDogMzkuOTUwNTM0LCBsbmc6IC03NS4xOTM2NTUsIGlzT3BlbjogdHJ1ZSB9LFxuICAgICAgICB7IGxhdDogMzkuOTUwNTQ5LCBsbmc6IC03NS4xOTM3ODQsIGlzT3BlbjogdHJ1ZSB9LFxuICAgICAgICB7IGxhdDogMzkuOTUwNTk2LCBsbmc6IC03NS4xOTQxNTAsIGlzT3BlbjogdHJ1ZSB9LFxuICAgICAgICB7IGxhdDogMzkuOTUwNjEwLCBsbmc6IC03NS4xOTQyNTYsIGlzT3BlbjogdHJ1ZSB9LFxuICAgICAgICB7IGxhdDogMzkuOTUwNjI0LCBsbmc6IC03NS4xOTQzNzYsIGlzT3BlbjogdHJ1ZSB9LFxuICAgICAgICB7IGxhdDogMzkuOTUwNjQxLCBsbmc6IC03NS4xOTQ1MDcsIGlzT3BlbjogdHJ1ZSB9LFxuICAgICAgICB7IGxhdDogMzkuOTUwNjQ5LCBsbmc6IC03NS4xOTQ1OTAsIGlzT3BlbjogdHJ1ZSB9LFxuICAgICAgICB7IGxhdDogMzkuOTUwNjU4LCBsbmc6IC03NS4xOTQ2NjYsIGlzT3BlbjogdHJ1ZSB9LFxuICAgICAgICB7IGxhdDogMzkuOTUwNzI5LCBsbmc6IC03NS4xOTQzNzcsIGlzT3BlbjogdHJ1ZSB9LFxuICAgICAgICB7IGxhdDogMzkuOTUwNzM1LCBsbmc6IC03NS4xOTQ0MzAsIGlzT3BlbjogdHJ1ZSB9LFxuICAgICAgICB7IGxhdDogMzkuOTUwNzQ3LCBsbmc6IC03NS4xOTQ1MTAsIGlzT3BlbjogdHJ1ZSB9LFxuICAgICAgICB7IGxhdDogMzkuOTUwNzUyLCBsbmc6IC03NS4xOTQ1ODcsIGlzT3BlbjogdHJ1ZSB9LFxuICAgICAgICB7IGxhdDogMzkuOTUwNzYzLCBsbmc6IC03NS4xOTQ2NzAsIGlzT3BlbjogdHJ1ZSB9XG4gICAgXSxcblxuICAgIGluaXRNYXAoKSB7XG5cbiAgICAgICAgdGhpcy5tYXAgPSBuZXcgZ29vZ2xlLm1hcHMuTWFwKCB0aGlzLmVscy5jb250YWluZXIsIHtcbiAgICAgICAgICBjZW50ZXI6IHsgbGF0OiAzOS45NTA1NjExLCBsbmc6IC03NS4xOTQ3MDE0IH0sXG4gICAgICAgICAgZGlzYWJsZURlZmF1bHRVSTogdHJ1ZSxcbiAgICAgICAgICB6b29tOiAxOFxuICAgICAgICB9IClcblxuICAgICAgICB0aGlzLmRhdGEuZm9yRWFjaCggZGF0dW0gPT4ge1xuICAgICAgICAgICAgZGF0dW0uaWNvbiA9IHtcbiAgICAgICAgICAgICAgICBwYXRoOiBcIk0wIDAgSCAxMCBWIDEwIEggMCBMIDAgMFwiLFxuICAgICAgICAgICAgICAgIGZpbGxDb2xvcjogZGF0dW0uaXNPcGVuID8gJ2dyZWVuJyA6ICdyZWQnLFxuICAgICAgICAgICAgICAgIGZpbGxPcGFjaXR5OiAuNixcbiAgICAgICAgICAgICAgICBhbmNob3I6IG5ldyBnb29nbGUubWFwcy5Qb2ludCgwLDApLFxuICAgICAgICAgICAgICAgIHN0cm9rZVdlaWdodDogMCxcbiAgICAgICAgICAgICAgICBzY2FsZTogMVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBkYXR1bS5tYXJrZXIgPSBuZXcgZ29vZ2xlLm1hcHMuTWFya2VyKCB7XG4gICAgICAgICAgICAgICAgcG9zaXRpb246IHsgbGF0OiBkYXR1bS5sYXQsIGxuZzogZGF0dW0ubG5nIH0sXG4gICAgICAgICAgICAgICAgbWFwOiB0aGlzLm1hcCxcbiAgICAgICAgICAgICAgICBkcmFnZ2FibGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGljb246IGRhdHVtLmljb25cbiAgICAgICAgICAgIH0gKTtcbiAgICAgICAgfSApXG5cbiAgICAgICAgc2V0SW50ZXJ2YWwoICgpID0+IHRoaXMudG9nZ2xlUmFuZG9tU3BvdCgpLCAyMDAwIClcbiAgICB9LFxuXG4gICAgcG9zdFJlbmRlcigpIHtcbiAgICAgICAgd2luZG93Lmdvb2dsZVxuICAgICAgICAgICAgPyB0aGlzLmluaXRNYXAoKVxuICAgICAgICAgICAgOiB3aW5kb3cuaW5pdE1hcCA9IHRoaXMuaW5pdE1hcFxuXG4gICAgICAgIHJldHVybiB0aGlzXG4gICAgfSxcblxuICAgIHRvZ2dsZVJhbmRvbVNwb3QoKSB7XG4gICAgICAgIGxldCBkYXR1bSA9IHRoaXMuZGF0YVsgTWF0aC5mbG9vciggTWF0aC5yYW5kb20oKSAqIHRoaXMuZGF0YS5sZW5ndGggKSBdXG5cbiAgICAgICAgZGF0dW0uaXNPcGVuID0gIWRhdHVtLmlzT3BlblxuICAgICAgICBkYXR1bS5pY29uLmZpbGxDb2xvciA9IGRhdHVtLmlzT3BlbiA/ICdncmVlbicgOiAncmVkJ1xuICAgICAgICBkYXR1bS5tYXJrZXIuc2V0KCAnaWNvbicsIGRhdHVtLmljb24gKVxuICAgIH1cblxufSApXG4iLCJtb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5hc3NpZ24oIHt9LCByZXF1aXJlKCcuL19fcHJvdG9fXycpLCB7XG59IClcbiIsIm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmFzc2lnbigge30sIHJlcXVpcmUoJy4vX19wcm90b19fJyksIHtcblxuICAgIGhhbmRsZVNpZGViYXJDbGljayggbmFtZSApIHtcbiAgICAgICAgaWYoIHRoaXMudmlld3NbIG5hbWUgXSApIHJldHVybiB0aGlzLnZpZXdzWyBuYW1lIF0uc2hvdygpXG5cbiAgICAgICAgdGhpcy52aWV3c1sgbmFtZSBdID0gdGhpcy5mYWN0b3J5LmNyZWF0ZSggbmFtZSwgT2JqZWN0LmFzc2lnbiggeyBpbnNlcnRpb246IHsgdmFsdWU6IHsgZWw6IHRoaXMuZWxzLm1haW4gfSB9IH0gKSApXG4gICAgfSxcblxuICAgIHBvc3RSZW5kZXIoKSB7XG4gICAgICAgIHRoaXMudmlld3Muc2lkZWJhci5vbiggJ2NsaWNrZWQnLCB0aGlzLmhhbmRsZVNpZGViYXJDbGljay5iaW5kKHRoaXMpIClcbiAgICAgICAgcmV0dXJuIHRoaXNcbiAgICB9LFxuICAgIFxuICAgIHNpemUoKSB7XG4gICAgICAgIC8vdGhpcy52aWV3cy5maXJlaG9zZS5lbHMuY29udGFpbmVyLnN0eWxlLmhlaWdodCA9IGAke3RoaXMuZWxzLmNvbnRhaW5lci5jbGllbnRIZWlnaHQgLSB0aGlzLnZpZXdzLmhlYWRlci5lbHMuY29udGFpbmVyLmNsaWVudEhlaWdodH1weGBcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG59IClcbiIsIm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmFzc2lnbigge30sIHJlcXVpcmUoJy4vX19wcm90b19fJyksIHtcbn0gKVxuIiwibW9kdWxlLmV4cG9ydHMgPSBPYmplY3QuYXNzaWduKCB7fSwgcmVxdWlyZSgnLi9fX3Byb3RvX18nKSwge1xuXG4gICAgZXZlbnRzOiB7XG4gICAgICAgIGxpc3Q6ICdjbGljaydcbiAgICB9LFxuXG4gICAgZ2V0VGVtcGxhdGVPcHRpb25zKCkgeyByZXR1cm4gdGhpcy5kYXRhIH0sXG5cbiAgICBkYXRhOiBbXG4gICAgICAgIHsgaWNvbjogcmVxdWlyZSgnLi90ZW1wbGF0ZXMvbGliL2hvbWUnKSwgbGFiZWw6ICdPdmVydmlldycsIG5hbWU6ICdvdmVydmlldycgfSxcbiAgICAgICAgeyBpY29uOiByZXF1aXJlKCcuL3RlbXBsYXRlcy9saWIvZG9sbGFyJyksIGxhYmVsOiAnQVBJIFJldmVudWUnLCBuYW1lOiAnYXBpJyB9LFxuICAgICAgICB7IGljb246IHJlcXVpcmUoJy4vdGVtcGxhdGVzL2xpYi9sb2NhdGlvbicpLCBsYWJlbDogJ0dlbycsIG5hbWU6ICdmaXJlaG9zZScgfVxuICAgIF0sXG5cbiAgICBvbkxpc3RDbGljayggZSApIHtcbiAgICAgICAgY29uc3QgaXRlbUVsID0gZS50YXJnZXQudGFnTmFtZSA9PT0gXCJMSVwiID8gZS50YXJnZXQgOiBlLnRhcmdldC5jbG9zZXN0KCdsaScpXG4gICAgICAgIHRoaXMuZW1pdCggJ2NsaWNrZWQnLCBpdGVtRWwuZ2V0QXR0cmlidXRlKCdkYXRhLW5hbWUnKSApXG4gICAgfSxcblxuICAgIHNpemUoKSB7XG4gICAgICAgIHRoaXMuZWxzLmxpc3Quc3R5bGUuaGVpZ2h0ID0gYCR7dGhpcy5lbHMuY29udGFpbmVyLmNsaWVudEhlaWdodCAtIHRoaXMuZWxzLmhlYWRlci5jbGllbnRIZWlnaHR9cHhgXG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgfVxufSApXG4iLCJtb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5hc3NpZ24oIHsgfSwgcmVxdWlyZSgnLi4vLi4vLi4vbGliL015T2JqZWN0JyksIHJlcXVpcmUoJ2V2ZW50cycpLkV2ZW50RW1pdHRlci5wcm90b3R5cGUsIHtcblxuICAgIE9wdGltaXplZFJlc2l6ZTogcmVxdWlyZSgnLi9saWIvT3B0aW1pemVkUmVzaXplJyksXG4gICAgXG4gICAgWGhyOiByZXF1aXJlKCcuLi9YaHInKSxcblxuICAgIGJpbmRFdmVudCgga2V5LCBldmVudCApIHtcbiAgICAgICAgdmFyIGVscyA9IEFycmF5LmlzQXJyYXkoIHRoaXMuZWxzWyBrZXkgXSApID8gdGhpcy5lbHNbIGtleSBdIDogWyB0aGlzLmVsc1sga2V5IF0gXVxuICAgICAgICBlbHMuZm9yRWFjaCggZWwgPT4gZWwuYWRkRXZlbnRMaXN0ZW5lciggZXZlbnQgfHwgJ2NsaWNrJywgZSA9PiB0aGlzWyBgb24ke3RoaXMuY2FwaXRhbGl6ZUZpcnN0TGV0dGVyKGtleSl9JHt0aGlzLmNhcGl0YWxpemVGaXJzdExldHRlcihldmVudCl9YCBdKCBlICkgKSApXG4gICAgfSxcblxuICAgIGNhcGl0YWxpemVGaXJzdExldHRlcjogc3RyaW5nID0+IHN0cmluZy5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHN0cmluZy5zbGljZSgxKSxcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuXG5cbiAgICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oIHRoaXMsIHsgZWxzOiB7IH0sIHNsdXJwOiB7IGF0dHI6ICdkYXRhLWpzJywgdmlldzogJ2RhdGEtdmlldycgfSwgdmlld3M6IHsgfSB9ICkucmVuZGVyKClcbiAgICB9LFxuXG4gICAgZGVsZWdhdGVFdmVudHMoIGtleSwgZWwgKSB7XG4gICAgICAgIHZhciB0eXBlID0gdHlwZW9mIHRoaXMuZXZlbnRzW2tleV1cblxuICAgICAgICBpZiggdHlwZSA9PT0gXCJzdHJpbmdcIiApIHsgdGhpcy5iaW5kRXZlbnQoIGtleSwgdGhpcy5ldmVudHNba2V5XSApIH1cbiAgICAgICAgZWxzZSBpZiggQXJyYXkuaXNBcnJheSggdGhpcy5ldmVudHNba2V5XSApICkge1xuICAgICAgICAgICAgdGhpcy5ldmVudHNbIGtleSBdLmZvckVhY2goIGV2ZW50T2JqID0+IHRoaXMuYmluZEV2ZW50KCBrZXksIGV2ZW50T2JqLmV2ZW50ICkgKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5iaW5kRXZlbnQoIGtleSwgdGhpcy5ldmVudHNba2V5XS5ldmVudCApXG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgZGVsZXRlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5oaWRlKClcbiAgICAgICAgLnRoZW4oICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuZWxzLmNvbnRhaW5lci5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKCB0aGlzLmVscy5jb250YWluZXIgKVxuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSggdGhpcy5lbWl0KCdkZWxldGVkJykgKVxuICAgICAgICB9IClcbiAgICB9LFxuXG4gICAgZXZlbnRzOiB7fSxcblxuICAgIGdldERhdGEoKSB7XG4gICAgICAgIGlmKCAhdGhpcy5tb2RlbCApIHRoaXMubW9kZWwgPSBPYmplY3QuY3JlYXRlKCB0aGlzLk1vZGVsLCB7IHJlc291cmNlOiB7IHZhbHVlOiB0aGlzLm5hbWUgfSB9IClcblxuICAgICAgICByZXR1cm4gdGhpcy5tb2RlbC5nZXQoKVxuICAgIH0sXG5cbiAgICBnZXRUZW1wbGF0ZU9wdGlvbnMoKSB7XG4gICAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKFxuICAgICAgICAgICAge30sXG4gICAgICAgICAgICAodGhpcy5tb2RlbCkgPyB0aGlzLm1vZGVsLmRhdGEgOiB7fSAsXG4gICAgICAgICAgICB7IHVzZXI6ICh0aGlzLnVzZXIpID8gdGhpcy51c2VyLmRhdGEgOiB7fSB9LFxuICAgICAgICAgICAgeyBvcHRzOiAodGhpcy50ZW1wbGF0ZU9wdHMpID8gdGhpcy50ZW1wbGF0ZU9wdHMgOiB7fSB9XG4gICAgICAgIClcbiAgICB9LFxuXG4gICAgaGlkZSgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKCByZXNvbHZlID0+IHtcbiAgICAgICAgICAgIGlmKCAhZG9jdW1lbnQuYm9keS5jb250YWlucyh0aGlzLmVscy5jb250YWluZXIpIHx8IHRoaXMuaXNIaWRkZW4oKSApIHJldHVybiByZXNvbHZlKClcbiAgICAgICAgICAgIHRoaXMub25IaWRkZW5Qcm94eSA9IGUgPT4gdGhpcy5vbkhpZGRlbihyZXNvbHZlKVxuICAgICAgICAgICAgdGhpcy5lbHMuY29udGFpbmVyLmFkZEV2ZW50TGlzdGVuZXIoICd0cmFuc2l0aW9uZW5kJywgdGhpcy5vbkhpZGRlblByb3h5IClcbiAgICAgICAgICAgIHRoaXMuZWxzLmNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKCdoaWRlJylcbiAgICAgICAgfSApXG4gICAgfSxcblxuICAgIGh0bWxUb0ZyYWdtZW50KCBzdHIgKSB7XG4gICAgICAgIGxldCByYW5nZSA9IGRvY3VtZW50LmNyZWF0ZVJhbmdlKCk7XG4gICAgICAgIC8vIG1ha2UgdGhlIHBhcmVudCBvZiB0aGUgZmlyc3QgZGl2IGluIHRoZSBkb2N1bWVudCBiZWNvbWVzIHRoZSBjb250ZXh0IG5vZGVcbiAgICAgICAgcmFuZ2Uuc2VsZWN0Tm9kZShkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZShcImRpdlwiKS5pdGVtKDApKVxuICAgICAgICByZXR1cm4gcmFuZ2UuY3JlYXRlQ29udGV4dHVhbEZyYWdtZW50KCBzdHIgKVxuICAgIH0sXG4gICAgXG4gICAgaXNIaWRkZW4oKSB7IHJldHVybiB0aGlzLmVscy5jb250YWluZXIuY2xhc3NMaXN0LmNvbnRhaW5zKCdoaWRkZW4nKSB9LFxuXG4gICAgb25IaWRkZW4oIHJlc29sdmUgKSB7XG4gICAgICAgIHRoaXMuZWxzLmNvbnRhaW5lci5yZW1vdmVFdmVudExpc3RlbmVyKCAndHJhbnNpdGlvbmVuZCcsIHRoaXMub25IaWRkZW5Qcm94eSApXG4gICAgICAgIHRoaXMuZWxzLmNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKVxuICAgICAgICByZXNvbHZlKCB0aGlzLmVtaXQoJ2hpZGRlbicpIClcbiAgICB9LFxuXG4gICAgb25Mb2dpbigpIHtcbiAgICAgICAgT2JqZWN0LmFzc2lnbiggdGhpcywgeyBlbHM6IHsgfSwgc2x1cnA6IHsgYXR0cjogJ2RhdGEtanMnLCB2aWV3OiAnZGF0YS12aWV3JyB9LCB2aWV3czogeyB9IH0gKS5yZW5kZXIoKVxuICAgIH0sXG5cbiAgICBvblNob3duKCByZXNvbHZlICkge1xuICAgICAgICB0aGlzLmVscy5jb250YWluZXIucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ3RyYW5zaXRpb25lbmQnLCB0aGlzLm9uU2hvd25Qcm94eSApXG4gICAgICAgIGlmKCB0aGlzLnNpemUgKSB0aGlzLnNpemUoKVxuICAgICAgICByZXNvbHZlKCB0aGlzLmVtaXQoJ3Nob3duJykgKVxuICAgIH0sXG5cbiAgICBzaG93Tm9BY2Nlc3MoKSB7XG4gICAgICAgIGFsZXJ0KFwiTm8gcHJpdmlsZWdlcywgc29uXCIpXG4gICAgICAgIHJldHVybiB0aGlzXG4gICAgfSxcblxuICAgIHBvc3RSZW5kZXIoKSB7IHJldHVybiB0aGlzIH0sXG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIHRoaXMuc2x1cnBUZW1wbGF0ZSggeyB0ZW1wbGF0ZTogdGhpcy50ZW1wbGF0ZSggdGhpcy5nZXRUZW1wbGF0ZU9wdGlvbnMoKSApLCBpbnNlcnRpb246IHRoaXMuaW5zZXJ0aW9uIH0gKVxuXG4gICAgICAgIHRoaXMucmVuZGVyU3Vidmlld3MoKVxuXG4gICAgICAgIGlmKCB0aGlzLnNpemUgKSB7IHRoaXMuc2l6ZSgpOyB0aGlzLk9wdGltaXplZFJlc2l6ZS5hZGQoIHRoaXMuc2l6ZS5iaW5kKHRoaXMpICkgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLnBvc3RSZW5kZXIoKVxuICAgIH0sXG5cbiAgICByZW5kZXJTdWJ2aWV3cygpIHtcbiAgICAgICAgT2JqZWN0LmtleXMoIHRoaXMuVmlld3MgfHwgeyB9ICkuZm9yRWFjaCgga2V5ID0+IHtcbiAgICAgICAgICAgIGlmKCB0aGlzLlZpZXdzWyBrZXkgXS5lbCApIHtcbiAgICAgICAgICAgICAgICBsZXQgb3B0cyA9IHRoaXMuVmlld3NbIGtleSBdLm9wdHNcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBvcHRzID0gKCBvcHRzIClcbiAgICAgICAgICAgICAgICAgICAgPyB0eXBlb2Ygb3B0cyA9PT0gXCJvYmplY3RcIlxuICAgICAgICAgICAgICAgICAgICAgICAgPyBvcHRzXG4gICAgICAgICAgICAgICAgICAgICAgICA6IG9wdHMoKVxuICAgICAgICAgICAgICAgICAgICA6IHt9XG5cbiAgICAgICAgICAgICAgICB0aGlzLnZpZXdzWyBrZXkgXSA9IHRoaXMuZmFjdG9yeS5jcmVhdGUoIGtleSwgT2JqZWN0LmFzc2lnbiggeyBpbnNlcnRpb246IHsgdmFsdWU6IHsgZWw6IHRoaXMuVmlld3NbIGtleSBdLmVsLCBtZXRob2Q6ICdpbnNlcnRCZWZvcmUnIH0gfSB9LCBvcHRzICkgKVxuICAgICAgICAgICAgICAgIHRoaXMuVmlld3NbIGtleSBdLmVsLnJlbW92ZSgpXG4gICAgICAgICAgICAgICAgdGhpcy5WaWV3c1sga2V5IF0uZWwgPSB1bmRlZmluZWRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSApXG5cbiAgICAgICAgcmV0dXJuIHRoaXNcbiAgICB9LFxuXG4gICAgc2hvdyggZHVyYXRpb24gKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSggcmVzb2x2ZSA9PiB7XG4gICAgICAgICAgICB0aGlzLm9uU2hvd25Qcm94eSA9IGUgPT4gdGhpcy5vblNob3duKHJlc29sdmUpXG4gICAgICAgICAgICB0aGlzLmVscy5jb250YWluZXIuYWRkRXZlbnRMaXN0ZW5lciggJ3RyYW5zaXRpb25lbmQnLCB0aGlzLm9uU2hvd25Qcm94eSApXG4gICAgICAgICAgICB0aGlzLmVscy5jb250YWluZXIuY2xhc3NMaXN0LnJlbW92ZSggJ2hpZGUnLCAnaGlkZGVuJyApXG4gICAgICAgIH0gKVxuICAgIH0sXG5cbiAgICBzbHVycEVsKCBlbCApIHtcbiAgICAgICAgdmFyIGtleSA9IGVsLmdldEF0dHJpYnV0ZSggdGhpcy5zbHVycC5hdHRyICkgfHwgJ2NvbnRhaW5lcidcblxuICAgICAgICBpZigga2V5ID09PSAnY29udGFpbmVyJyApIGVsLmNsYXNzTGlzdC5hZGQoIHRoaXMubmFtZSApXG5cbiAgICAgICAgdGhpcy5lbHNbIGtleSBdID0gQXJyYXkuaXNBcnJheSggdGhpcy5lbHNbIGtleSBdIClcbiAgICAgICAgICAgID8gdGhpcy5lbHNbIGtleSBdLnB1c2goIGVsIClcbiAgICAgICAgICAgIDogKCB0aGlzLmVsc1sga2V5IF0gIT09IHVuZGVmaW5lZCApXG4gICAgICAgICAgICAgICAgPyBbIHRoaXMuZWxzWyBrZXkgXSwgZWwgXVxuICAgICAgICAgICAgICAgIDogZWxcblxuICAgICAgICBlbC5yZW1vdmVBdHRyaWJ1dGUodGhpcy5zbHVycC5hdHRyKVxuXG4gICAgICAgIGlmKCB0aGlzLmV2ZW50c1sga2V5IF0gKSB0aGlzLmRlbGVnYXRlRXZlbnRzKCBrZXksIGVsIClcbiAgICB9LFxuXG4gICAgc2x1cnBUZW1wbGF0ZSggb3B0aW9ucyApIHtcbiAgICAgICAgdmFyIGZyYWdtZW50ID0gdGhpcy5odG1sVG9GcmFnbWVudCggb3B0aW9ucy50ZW1wbGF0ZSApLFxuICAgICAgICAgICAgc2VsZWN0b3IgPSBgWyR7dGhpcy5zbHVycC5hdHRyfV1gLFxuICAgICAgICAgICAgdmlld1NlbGVjdG9yID0gYFske3RoaXMuc2x1cnAudmlld31dYFxuXG4gICAgICAgIHRoaXMuc2x1cnBFbCggZnJhZ21lbnQucXVlcnlTZWxlY3RvcignKicpIClcbiAgICAgICAgZnJhZ21lbnQucXVlcnlTZWxlY3RvckFsbCggYCR7c2VsZWN0b3J9LCAke3ZpZXdTZWxlY3Rvcn1gICkuZm9yRWFjaCggZWwgPT4ge1xuICAgICAgICAgICAgaWYoIGVsLmhhc0F0dHJpYnV0ZSggdGhpcy5zbHVycC5hdHRyICkgKSB7IHRoaXMuc2x1cnBFbCggZWwgKSB9XG4gICAgICAgICAgICBlbHNlIGlmKCBlbC5oYXNBdHRyaWJ1dGUoIHRoaXMuc2x1cnAudmlldyApICkge1xuICAgICAgICAgICAgICAgIGlmKCAhIHRoaXMuVmlld3NbIGVsLmdldEF0dHJpYnV0ZSh0aGlzLnNsdXJwLnZpZXcpIF0gKSB0aGlzLlZpZXdzWyBlbC5nZXRBdHRyaWJ1dGUodGhpcy5zbHVycC52aWV3KSBdID0geyB9XG4gICAgICAgICAgICAgICAgdGhpcy5WaWV3c1sgZWwuZ2V0QXR0cmlidXRlKHRoaXMuc2x1cnAudmlldykgXS5lbCA9IGVsXG4gICAgICAgICAgICB9XG4gICAgICAgIH0gKVxuICAgICAgICAgIFxuICAgICAgICBvcHRpb25zLmluc2VydGlvbi5tZXRob2QgPT09ICdpbnNlcnRCZWZvcmUnXG4gICAgICAgICAgICA/IG9wdGlvbnMuaW5zZXJ0aW9uLmVsLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKCBmcmFnbWVudCwgb3B0aW9ucy5pbnNlcnRpb24uZWwgKVxuICAgICAgICAgICAgOiBvcHRpb25zLmluc2VydGlvbi5lbFsgb3B0aW9ucy5pbnNlcnRpb24ubWV0aG9kIHx8ICdhcHBlbmRDaGlsZCcgXSggZnJhZ21lbnQgKVxuXG4gICAgICAgIHJldHVybiB0aGlzXG4gICAgfVxufSApXG4iLCJtb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5jcmVhdGUoIHtcblxuICAgIGFkZChjYWxsYmFjaykge1xuICAgICAgICBpZiggIXRoaXMuY2FsbGJhY2tzLmxlbmd0aCApIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCB0aGlzLm9uUmVzaXplLmJpbmQodGhpcykgKVxuICAgICAgICB0aGlzLmNhbGxiYWNrcy5wdXNoKGNhbGxiYWNrKVxuICAgIH0sXG5cbiAgICBvblJlc2l6ZSgpIHtcbiAgICAgICBpZiggdGhpcy5ydW5uaW5nICkgcmV0dXJuXG5cbiAgICAgICAgdGhpcy5ydW5uaW5nID0gdHJ1ZVxuICAgICAgICBcbiAgICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZVxuICAgICAgICAgICAgPyB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKCB0aGlzLnJ1bkNhbGxiYWNrcy5iaW5kKHRoaXMpIClcbiAgICAgICAgICAgIDogc2V0VGltZW91dCggdGhpcy5ydW5DYWxsYmFja3MsIDY2KVxuICAgIH0sXG5cbiAgICBydW5DYWxsYmFja3MoKSB7XG4gICAgICAgIHRoaXMuY2FsbGJhY2tzID0gdGhpcy5jYWxsYmFja3MuZmlsdGVyKCBjYWxsYmFjayA9PiBjYWxsYmFjaygpIClcbiAgICAgICAgdGhpcy5ydW5uaW5nID0gZmFsc2UgXG4gICAgfVxuXG59LCB7IGNhbGxiYWNrczogeyB3cml0YWJsZTogdHJ1ZSwgdmFsdWU6IFtdIH0sIHJ1bm5pbmc6IHsgd3JpdGFibGU6IHRydWUsIHZhbHVlOiBmYWxzZSB9IH0gKVxuIiwibW9kdWxlLmV4cG9ydHMgPSBwID0+IGA8ZGl2IGlkPVwidml6XCI+PC9kaXY+YFxuIiwibW9kdWxlLmV4cG9ydHMgPSBwID0+IGA8ZGl2PjwvZGl2PmBcbiIsIm1vZHVsZS5leHBvcnRzID0gcCA9PlxuYDxkaXY+XG4gICAgPHNwYW4+Q2hpbmEgVW5pY29tPC9zcGFuPlxuICAgIDxkaXY+XG4gICAgICAgIDxpbnB1dCBkYXRhLWpzPVwiZnJvbVwiIHR5cGU9XCJ0ZXh0XCIgLz5cbiAgICAgICAgPHNwYW4+dG88L3NwYW4+XG4gICAgICAgIDxpbnB1dCBkYXRhLWpzPVwidG9cIiB0eXBlPVwidGV4dFwiIC8+XG4gICAgPC9kaXY+XG48L2Rpdj5gXG4iLCJtb2R1bGUuZXhwb3J0cyA9IHAgPT4gXG5gPGRpdiBjbGFzcz1cImNsZWFmaXhcIj5cbiAgICA8ZGl2IGRhdGEtdmlldz1cInNpZGViYXJcIj48L2Rpdj5cbiAgICA8ZGl2IGRhdGEtanM9XCJtYWluXCIgY2xhc3M9XCJtYWluXCI+PC9kaXY+XG48L2Rpdj5gXG4iLCJtb2R1bGUuZXhwb3J0cyA9IHAgPT4gXG5gPGRpdj5cbiAgICA8ZGl2IGNsYXNzPVwiaGVhZGVyXCI+XG4gICAgICAgIDxzcGFuPk92ZXJ2aWV3PC9zcGFuPlxuICAgICAgICA8c3Bhbj5PdmVydmlldzwvc3Bhbj5cbiAgICA8L2Rpdj5cbjwvZGl2PmBcbiIsIm1vZHVsZS5leHBvcnRzID0gcCA9PiB7XG4gICAgY29uc3QgbGlzdCA9IHAubWFwKCBpdGVtID0+IGA8bGkgZGF0YS1uYW1lPVwiJHtpdGVtLm5hbWV9XCIgY2xhc3M9XCJjbGVhcmZpeFwiPiR7aXRlbS5pY29ufTxzcGFuIGNsYXNzPVwibGFiZWxcIj4ke2l0ZW0ubGFiZWx9PC9zcGFuPjwvbGk+YCApLmpvaW4oJycpXG4gICAgcmV0dXJuIGA8ZGl2PlxuICAgICAgICA8ZGl2IGRhdGEtanM9XCJoZWFkZXJcIiBjbGFzcz1cImhlYWRlclwiPlxuICAgICAgICAgICAgPGltZyBjbGFzcz1cImxvZ29cIiBzcmM9XCIvc3RhdGljL2ltZy9sb2dvLnBuZ1wiLz5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDx1bCBkYXRhLWpzPVwibGlzdFwiPiR7bGlzdH08L3VsPlxuICAgIDwvZGl2PmBcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gYDxzdmcgdmVyc2lvbj1cIjEuMVwiIGlkPVwiQ2FwYV8xXCIgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHhtbG5zOnhsaW5rPVwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGlua1wiIHg9XCIwcHhcIiB5PVwiMHB4XCJcclxuXHQgd2lkdGg9XCI2MTEuOTk0cHhcIiBoZWlnaHQ9XCI2MTEuOTk0cHhcIiB2aWV3Qm94PVwiMCAwIDYxMS45OTQgNjExLjk5NFwiIHN0eWxlPVwiZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA2MTEuOTk0IDYxMS45OTQ7XCJcclxuXHQgeG1sOnNwYWNlPVwicHJlc2VydmVcIj5cclxuPGc+XHJcbiAgICA8cGF0aCBkPVwiTTMwNi4wMDksNDgxLjMwM2MtNTUuNTk1LDAtMTAwLjgzMy00Mi42MjEtMTAwLjgzMy05NS4wMDRjMC04LjEyMiw2LjU4MS0xNC43MDMsMTQuNzAzLTE0LjcwM1xyXG4gICAgICAgIHMxNC43MDMsNi41ODEsMTQuNzAzLDE0LjcwM2MwLDM2LjE2OSwzMi4wNDEsNjUuNiw3MS40MjcsNjUuNnM3MS40MTUtMjkuNDMxLDcxLjQxNS02NS42YzAtMzYuMTctMzIuMDM1LTY1LjU5OS03MS40MTUtNjUuNTk5XHJcbiAgICAgICAgYy01NS41OTUsMC0xMDAuODMzLTQyLjYyMS0xMDAuODMzLTk1LjAwNGMwLTUyLjM4NCw0NS4yMzgtOTUuMDA0LDEwMC44MzMtOTUuMDA0YzI5Ljg1NCwwLDU3Ljk4OCwxMi4zNTEsNzcuMTk2LDMzLjg4N1xyXG4gICAgICAgIGM1LjQwNCw2LjA2Myw0Ljg2OSwxNS4zNTUtMS4xODgsMjAuNzZjLTYuMDU4LDUuNDExLTE1LjM1NCw0Ljg3LTIwLjc2LTEuMTg4Yy0xMy42MjctMTUuMjg1LTMzLjc2NC0yNC4wNTQtNTUuMjQ4LTI0LjA1NFxyXG4gICAgICAgIGMtMzkuMzgsMC03MS40MjcsMjkuNDIzLTcxLjQyNyw2NS41OTljMCwzNi4xNjksMzIuMDQxLDY1LjU5OCw3MS40MjcsNjUuNTk4YzU1LjU5NiwwLDEwMC44MjEsNDIuNjIxLDEwMC44MjEsOTUuMDA1XHJcbiAgICAgICAgQzQwNi44MzYsNDM4LjY4MiwzNjEuNjA0LDQ4MS4zMDMsMzA2LjAwOSw0ODEuMzAzelwiLz5cclxuICAgIDxwYXRoIGQ9XCJNMzAzLjMxNSw1MjUuMjM1Yy04LjEyMiwwLTE0LjcwMy02LjU4MS0xNC43MDMtMTQuNzAzdi00MDkuMDdjMC04LjEyMiw2LjU4MS0xNC43MDMsMTQuNzAzLTE0LjcwM1xyXG4gICAgICAgIGM4LjEyMywwLDE0LjcwMyw2LjU4MSwxNC43MDMsMTQuNzAzdjQwOS4wN0MzMTguMDE5LDUxOC42NTQsMzExLjQzOCw1MjUuMjM1LDMwMy4zMTUsNTI1LjIzNXpcIi8+XHJcbjwvZz5cclxuPC9zdmc+YFxyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IGA8c3ZnIHZlcnNpb249XCIxLjFcIiBpZD1cIkNhcGFfMVwiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB4bWxuczp4bGluaz1cImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmtcIiB4PVwiMHB4XCIgeT1cIjBweFwiXHJcblx0IHZpZXdCb3g9XCIwIDAgNTguMzY1IDU4LjM2NVwiIHN0eWxlPVwiZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1OC4zNjUgNTguMzY1O1wiIHhtbDpzcGFjZT1cInByZXNlcnZlXCI+XHJcbjxwYXRoIGQ9XCJNNTcuODYzLDI2LjYzMmwtOC42ODEtOC4wNjFWNS4zNjVoLTEwdjMuOTIxTDI5LjE4MiwwTDAuNTAyLDI2LjYzMmMtMC40MDQsMC4zNzYtMC40MjgsMS4wMDktMC4wNTIsMS40MTRcclxuXHRjMC4zNzUsMC40MDQsMS4wMDgsMC40MjcsMS40MTQsMC4wNTJsMy4zMTktMy4wODJ2MzMuMzQ5aDE2aDE2aDE2VjI1LjAxNWwzLjMxOSwzLjA4MmMwLjE5MiwwLjE3OSwwLjQzNywwLjI2NywwLjY4MSwwLjI2N1xyXG5cdGMwLjI2OSwwLDAuNTM2LTAuMTA3LDAuNzMyLTAuMzE5QzU4LjI5MSwyNy42NDEsNTguMjY3LDI3LjAwOCw1Ny44NjMsMjYuNjMyeiBNNDEuMTgyLDcuMzY1aDZ2OS4zNDlsLTYtNS41NzFWNy4zNjV6XHJcblx0IE0yMy4xODIsNTYuMzY1VjM1LjMwMmMwLTAuNTE3LDAuNDItMC45MzcsMC45MzctMC45MzdoMTAuMTI2YzAuNTE3LDAsMC45MzcsMC40MiwwLjkzNywwLjkzN3YyMS4wNjNIMjMuMTgyeiBNNTEuMTgyLDU2LjM2NWgtMTRcclxuXHRWMzUuMzAyYzAtMS42Mi0xLjMxNy0yLjkzNy0yLjkzNy0yLjkzN0gyNC4xMTljLTEuNjIsMC0yLjkzNywxLjMxNy0yLjkzNywyLjkzN3YyMS4wNjNoLTE0VjIzLjE1OGwyMi0yMC40MjlsMTQuMjgsMTMuMjZcclxuXHRsNS43Miw1LjMxMXYwbDIsMS44NTdWNTYuMzY1elwiLz5cclxuPC9zdmc+YFxyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IGBcclxuPHN2ZyB2ZXJzaW9uPVwiMS4xXCIgaWQ9XCJDYXBhXzFcIiB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgeG1sbnM6eGxpbms9XCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rXCIgeD1cIjBweFwiIHk9XCIwcHhcIlxyXG5cdCB3aWR0aD1cIjQ5MS41ODJweFwiIGhlaWdodD1cIjQ5MS41ODJweFwiIHZpZXdCb3g9XCIwIDAgNDkxLjU4MiA0OTEuNTgyXCIgc3R5bGU9XCJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDQ5MS41ODIgNDkxLjU4MjtcIlxyXG5cdCB4bWw6c3BhY2U9XCJwcmVzZXJ2ZVwiPlxyXG48Zz5cclxuXHQ8Zz5cclxuXHRcdDxwYXRoIGQ9XCJNMjQ1Ljc5MSwwQzE1My43OTksMCw3OC45NTcsNzQuODQxLDc4Ljk1NywxNjYuODMzYzAsMzYuOTY3LDIxLjc2NCw5My4xODcsNjguNDkzLDE3Ni45MjZcclxuXHRcdFx0YzMxLjg4Nyw1Ny4xMzgsNjMuNjI3LDEwNS40LDY0Ljk2NiwxMDcuNDMzbDIyLjk0MSwzNC43NzNjMi4zMTMsMy41MDcsNi4yMzIsNS42MTcsMTAuNDM0LDUuNjE3czguMTIxLTIuMTEsMTAuNDM0LTUuNjE3XHJcblx0XHRcdGwyMi45NC0zNC43NzFjMS4zMjYtMi4wMSwzMi44MzUtNDkuODU1LDY0Ljk2Ny0xMDcuNDM1YzQ2LjcyOS04My43MzUsNjguNDkzLTEzOS45NTUsNjguNDkzLTE3Ni45MjZcclxuXHRcdFx0QzQxMi42MjUsNzQuODQxLDMzNy43ODMsMCwyNDUuNzkxLDB6IE0zMjIuMzAyLDMzMS41NzZjLTMxLjY4NSw1Ni43NzUtNjIuNjk2LDEwMy44NjktNjQuMDAzLDEwNS44NDhsLTEyLjUwOCwxOC45NTlcclxuXHRcdFx0bC0xMi41MDQtMTguOTU0Yy0xLjMxNC0xLjk5NS0zMi41NjMtNDkuNTExLTY0LjAwNy0xMDUuODUzYy00My4zNDUtNzcuNjc2LTY1LjMyMy0xMzMuMTA0LTY1LjMyMy0xNjQuNzQzXHJcblx0XHRcdEMxMDMuOTU3LDg4LjYyNiwxNjcuNTgzLDI1LDI0NS43OTEsMjVzMTQxLjgzNCw2My42MjYsMTQxLjgzNCwxNDEuODMzQzM4Ny42MjUsMTk4LjQ3NiwzNjUuNjQ3LDI1My45MDIsMzIyLjMwMiwzMzEuNTc2elwiLz5cclxuXHRcdDxwYXRoIGQ9XCJNMjQ1Ljc5MSw3My4yOTFjLTUxLjAwNSwwLTkyLjUsNDEuNDk2LTkyLjUsOTIuNXM0MS40OTUsOTIuNSw5Mi41LDkyLjVzOTIuNS00MS40OTYsOTIuNS05Mi41XHJcblx0XHRcdFMyOTYuNzk2LDczLjI5MSwyNDUuNzkxLDczLjI5MXogTTI0NS43OTEsMjMzLjI5MWMtMzcuMjIsMC02Ny41LTMwLjI4LTY3LjUtNjcuNXMzMC4yOC02Ny41LDY3LjUtNjcuNVxyXG5cdFx0XHRjMzcuMjIxLDAsNjcuNSwzMC4yOCw2Ny41LDY3LjVTMjgzLjAxMiwyMzMuMjkxLDI0NS43OTEsMjMzLjI5MXpcIi8+XHJcblx0PC9nPlxyXG48L2c+XHJcbjwvc3ZnPmBcclxuIiwibW9kdWxlLmV4cG9ydHMgPSBlcnIgPT4geyBjb25zb2xlLmxvZyggZXJyLnN0YWNrIHx8IGVyciApIH1cbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuXG4gICAgRXJyb3I6IHJlcXVpcmUoJy4vTXlFcnJvcicpLFxuXG4gICAgUDogKCBmdW4sIGFyZ3M9WyBdLCB0aGlzQXJnICkgPT5cbiAgICAgICAgbmV3IFByb21pc2UoICggcmVzb2x2ZSwgcmVqZWN0ICkgPT4gUmVmbGVjdC5hcHBseSggZnVuLCB0aGlzQXJnIHx8IHRoaXMsIGFyZ3MuY29uY2F0KCAoIGUsIC4uLmNhbGxiYWNrICkgPT4gZSA/IHJlamVjdChlKSA6IHJlc29sdmUoY2FsbGJhY2spICkgKSApLFxuICAgIFxuICAgIGNvbnN0cnVjdG9yKCkgeyByZXR1cm4gdGhpcyB9XG59XG4iLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxuZnVuY3Rpb24gRXZlbnRFbWl0dGVyKCkge1xuICB0aGlzLl9ldmVudHMgPSB0aGlzLl9ldmVudHMgfHwge307XG4gIHRoaXMuX21heExpc3RlbmVycyA9IHRoaXMuX21heExpc3RlbmVycyB8fCB1bmRlZmluZWQ7XG59XG5tb2R1bGUuZXhwb3J0cyA9IEV2ZW50RW1pdHRlcjtcblxuLy8gQmFja3dhcmRzLWNvbXBhdCB3aXRoIG5vZGUgMC4xMC54XG5FdmVudEVtaXR0ZXIuRXZlbnRFbWl0dGVyID0gRXZlbnRFbWl0dGVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9ldmVudHMgPSB1bmRlZmluZWQ7XG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9tYXhMaXN0ZW5lcnMgPSB1bmRlZmluZWQ7XG5cbi8vIEJ5IGRlZmF1bHQgRXZlbnRFbWl0dGVycyB3aWxsIHByaW50IGEgd2FybmluZyBpZiBtb3JlIHRoYW4gMTAgbGlzdGVuZXJzIGFyZVxuLy8gYWRkZWQgdG8gaXQuIFRoaXMgaXMgYSB1c2VmdWwgZGVmYXVsdCB3aGljaCBoZWxwcyBmaW5kaW5nIG1lbW9yeSBsZWFrcy5cbkV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzID0gMTA7XG5cbi8vIE9idmlvdXNseSBub3QgYWxsIEVtaXR0ZXJzIHNob3VsZCBiZSBsaW1pdGVkIHRvIDEwLiBUaGlzIGZ1bmN0aW9uIGFsbG93c1xuLy8gdGhhdCB0byBiZSBpbmNyZWFzZWQuIFNldCB0byB6ZXJvIGZvciB1bmxpbWl0ZWQuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnNldE1heExpc3RlbmVycyA9IGZ1bmN0aW9uKG4pIHtcbiAgaWYgKCFpc051bWJlcihuKSB8fCBuIDwgMCB8fCBpc05hTihuKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ24gbXVzdCBiZSBhIHBvc2l0aXZlIG51bWJlcicpO1xuICB0aGlzLl9tYXhMaXN0ZW5lcnMgPSBuO1xuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIGVyLCBoYW5kbGVyLCBsZW4sIGFyZ3MsIGksIGxpc3RlbmVycztcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcblxuICAvLyBJZiB0aGVyZSBpcyBubyAnZXJyb3InIGV2ZW50IGxpc3RlbmVyIHRoZW4gdGhyb3cuXG4gIGlmICh0eXBlID09PSAnZXJyb3InKSB7XG4gICAgaWYgKCF0aGlzLl9ldmVudHMuZXJyb3IgfHxcbiAgICAgICAgKGlzT2JqZWN0KHRoaXMuX2V2ZW50cy5lcnJvcikgJiYgIXRoaXMuX2V2ZW50cy5lcnJvci5sZW5ndGgpKSB7XG4gICAgICBlciA9IGFyZ3VtZW50c1sxXTtcbiAgICAgIGlmIChlciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgIHRocm93IGVyOyAvLyBVbmhhbmRsZWQgJ2Vycm9yJyBldmVudFxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gQXQgbGVhc3QgZ2l2ZSBzb21lIGtpbmQgb2YgY29udGV4dCB0byB0aGUgdXNlclxuICAgICAgICB2YXIgZXJyID0gbmV3IEVycm9yKCdVbmNhdWdodCwgdW5zcGVjaWZpZWQgXCJlcnJvclwiIGV2ZW50LiAoJyArIGVyICsgJyknKTtcbiAgICAgICAgZXJyLmNvbnRleHQgPSBlcjtcbiAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGhhbmRsZXIgPSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgaWYgKGlzVW5kZWZpbmVkKGhhbmRsZXIpKVxuICAgIHJldHVybiBmYWxzZTtcblxuICBpZiAoaXNGdW5jdGlvbihoYW5kbGVyKSkge1xuICAgIHN3aXRjaCAoYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgLy8gZmFzdCBjYXNlc1xuICAgICAgY2FzZSAxOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAyOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcywgYXJndW1lbnRzWzFdKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDM6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0sIGFyZ3VtZW50c1syXSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgLy8gc2xvd2VyXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICAgICAgaGFuZGxlci5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoaXNPYmplY3QoaGFuZGxlcikpIHtcbiAgICBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICBsaXN0ZW5lcnMgPSBoYW5kbGVyLnNsaWNlKCk7XG4gICAgbGVuID0gbGlzdGVuZXJzLmxlbmd0aDtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuOyBpKyspXG4gICAgICBsaXN0ZW5lcnNbaV0uYXBwbHkodGhpcywgYXJncyk7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICB2YXIgbTtcblxuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgdGhpcy5fZXZlbnRzID0ge307XG5cbiAgLy8gVG8gYXZvaWQgcmVjdXJzaW9uIGluIHRoZSBjYXNlIHRoYXQgdHlwZSA9PT0gXCJuZXdMaXN0ZW5lclwiISBCZWZvcmVcbiAgLy8gYWRkaW5nIGl0IHRvIHRoZSBsaXN0ZW5lcnMsIGZpcnN0IGVtaXQgXCJuZXdMaXN0ZW5lclwiLlxuICBpZiAodGhpcy5fZXZlbnRzLm5ld0xpc3RlbmVyKVxuICAgIHRoaXMuZW1pdCgnbmV3TGlzdGVuZXInLCB0eXBlLFxuICAgICAgICAgICAgICBpc0Z1bmN0aW9uKGxpc3RlbmVyLmxpc3RlbmVyKSA/XG4gICAgICAgICAgICAgIGxpc3RlbmVyLmxpc3RlbmVyIDogbGlzdGVuZXIpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIC8vIE9wdGltaXplIHRoZSBjYXNlIG9mIG9uZSBsaXN0ZW5lci4gRG9uJ3QgbmVlZCB0aGUgZXh0cmEgYXJyYXkgb2JqZWN0LlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXSA9IGxpc3RlbmVyO1xuICBlbHNlIGlmIChpc09iamVjdCh0aGlzLl9ldmVudHNbdHlwZV0pKVxuICAgIC8vIElmIHdlJ3ZlIGFscmVhZHkgZ290IGFuIGFycmF5LCBqdXN0IGFwcGVuZC5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0ucHVzaChsaXN0ZW5lcik7XG4gIGVsc2VcbiAgICAvLyBBZGRpbmcgdGhlIHNlY29uZCBlbGVtZW50LCBuZWVkIHRvIGNoYW5nZSB0byBhcnJheS5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0gPSBbdGhpcy5fZXZlbnRzW3R5cGVdLCBsaXN0ZW5lcl07XG5cbiAgLy8gQ2hlY2sgZm9yIGxpc3RlbmVyIGxlYWtcbiAgaWYgKGlzT2JqZWN0KHRoaXMuX2V2ZW50c1t0eXBlXSkgJiYgIXRoaXMuX2V2ZW50c1t0eXBlXS53YXJuZWQpIHtcbiAgICBpZiAoIWlzVW5kZWZpbmVkKHRoaXMuX21heExpc3RlbmVycykpIHtcbiAgICAgIG0gPSB0aGlzLl9tYXhMaXN0ZW5lcnM7XG4gICAgfSBlbHNlIHtcbiAgICAgIG0gPSBFdmVudEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycztcbiAgICB9XG5cbiAgICBpZiAobSAmJiBtID4gMCAmJiB0aGlzLl9ldmVudHNbdHlwZV0ubGVuZ3RoID4gbSkge1xuICAgICAgdGhpcy5fZXZlbnRzW3R5cGVdLndhcm5lZCA9IHRydWU7XG4gICAgICBjb25zb2xlLmVycm9yKCcobm9kZSkgd2FybmluZzogcG9zc2libGUgRXZlbnRFbWl0dGVyIG1lbW9yeSAnICtcbiAgICAgICAgICAgICAgICAgICAgJ2xlYWsgZGV0ZWN0ZWQuICVkIGxpc3RlbmVycyBhZGRlZC4gJyArXG4gICAgICAgICAgICAgICAgICAgICdVc2UgZW1pdHRlci5zZXRNYXhMaXN0ZW5lcnMoKSB0byBpbmNyZWFzZSBsaW1pdC4nLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9ldmVudHNbdHlwZV0ubGVuZ3RoKTtcbiAgICAgIGlmICh0eXBlb2YgY29uc29sZS50cmFjZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAvLyBub3Qgc3VwcG9ydGVkIGluIElFIDEwXG4gICAgICAgIGNvbnNvbGUudHJhY2UoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub24gPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgdmFyIGZpcmVkID0gZmFsc2U7XG5cbiAgZnVuY3Rpb24gZygpIHtcbiAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGcpO1xuXG4gICAgaWYgKCFmaXJlZCkge1xuICAgICAgZmlyZWQgPSB0cnVlO1xuICAgICAgbGlzdGVuZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG4gIH1cblxuICBnLmxpc3RlbmVyID0gbGlzdGVuZXI7XG4gIHRoaXMub24odHlwZSwgZyk7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vLyBlbWl0cyBhICdyZW1vdmVMaXN0ZW5lcicgZXZlbnQgaWZmIHRoZSBsaXN0ZW5lciB3YXMgcmVtb3ZlZFxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIHZhciBsaXN0LCBwb3NpdGlvbiwgbGVuZ3RoLCBpO1xuXG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIHJldHVybiB0aGlzO1xuXG4gIGxpc3QgPSB0aGlzLl9ldmVudHNbdHlwZV07XG4gIGxlbmd0aCA9IGxpc3QubGVuZ3RoO1xuICBwb3NpdGlvbiA9IC0xO1xuXG4gIGlmIChsaXN0ID09PSBsaXN0ZW5lciB8fFxuICAgICAgKGlzRnVuY3Rpb24obGlzdC5saXN0ZW5lcikgJiYgbGlzdC5saXN0ZW5lciA9PT0gbGlzdGVuZXIpKSB7XG4gICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICBpZiAodGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKVxuICAgICAgdGhpcy5lbWl0KCdyZW1vdmVMaXN0ZW5lcicsIHR5cGUsIGxpc3RlbmVyKTtcblxuICB9IGVsc2UgaWYgKGlzT2JqZWN0KGxpc3QpKSB7XG4gICAgZm9yIChpID0gbGVuZ3RoOyBpLS0gPiAwOykge1xuICAgICAgaWYgKGxpc3RbaV0gPT09IGxpc3RlbmVyIHx8XG4gICAgICAgICAgKGxpc3RbaV0ubGlzdGVuZXIgJiYgbGlzdFtpXS5saXN0ZW5lciA9PT0gbGlzdGVuZXIpKSB7XG4gICAgICAgIHBvc2l0aW9uID0gaTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHBvc2l0aW9uIDwgMClcbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgaWYgKGxpc3QubGVuZ3RoID09PSAxKSB7XG4gICAgICBsaXN0Lmxlbmd0aCA9IDA7XG4gICAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIH0gZWxzZSB7XG4gICAgICBsaXN0LnNwbGljZShwb3NpdGlvbiwgMSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcilcbiAgICAgIHRoaXMuZW1pdCgncmVtb3ZlTGlzdGVuZXInLCB0eXBlLCBsaXN0ZW5lcik7XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlQWxsTGlzdGVuZXJzID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIga2V5LCBsaXN0ZW5lcnM7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgcmV0dXJuIHRoaXM7XG5cbiAgLy8gbm90IGxpc3RlbmluZyBmb3IgcmVtb3ZlTGlzdGVuZXIsIG5vIG5lZWQgdG8gZW1pdFxuICBpZiAoIXRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcikge1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKVxuICAgICAgdGhpcy5fZXZlbnRzID0ge307XG4gICAgZWxzZSBpZiAodGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIGVtaXQgcmVtb3ZlTGlzdGVuZXIgZm9yIGFsbCBsaXN0ZW5lcnMgb24gYWxsIGV2ZW50c1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgIGZvciAoa2V5IGluIHRoaXMuX2V2ZW50cykge1xuICAgICAgaWYgKGtleSA9PT0gJ3JlbW92ZUxpc3RlbmVyJykgY29udGludWU7XG4gICAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycyhrZXkpO1xuICAgIH1cbiAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycygncmVtb3ZlTGlzdGVuZXInKTtcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGxpc3RlbmVycyA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICBpZiAoaXNGdW5jdGlvbihsaXN0ZW5lcnMpKSB7XG4gICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcnMpO1xuICB9IGVsc2UgaWYgKGxpc3RlbmVycykge1xuICAgIC8vIExJRk8gb3JkZXJcbiAgICB3aGlsZSAobGlzdGVuZXJzLmxlbmd0aClcbiAgICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXJzW2xpc3RlbmVycy5sZW5ndGggLSAxXSk7XG4gIH1cbiAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJzID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIgcmV0O1xuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIHJldCA9IFtdO1xuICBlbHNlIGlmIChpc0Z1bmN0aW9uKHRoaXMuX2V2ZW50c1t0eXBlXSkpXG4gICAgcmV0ID0gW3RoaXMuX2V2ZW50c1t0eXBlXV07XG4gIGVsc2VcbiAgICByZXQgPSB0aGlzLl9ldmVudHNbdHlwZV0uc2xpY2UoKTtcbiAgcmV0dXJuIHJldDtcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJDb3VudCA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgaWYgKHRoaXMuX2V2ZW50cykge1xuICAgIHZhciBldmxpc3RlbmVyID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gICAgaWYgKGlzRnVuY3Rpb24oZXZsaXN0ZW5lcikpXG4gICAgICByZXR1cm4gMTtcbiAgICBlbHNlIGlmIChldmxpc3RlbmVyKVxuICAgICAgcmV0dXJuIGV2bGlzdGVuZXIubGVuZ3RoO1xuICB9XG4gIHJldHVybiAwO1xufTtcblxuRXZlbnRFbWl0dGVyLmxpc3RlbmVyQ291bnQgPSBmdW5jdGlvbihlbWl0dGVyLCB0eXBlKSB7XG4gIHJldHVybiBlbWl0dGVyLmxpc3RlbmVyQ291bnQodHlwZSk7XG59O1xuXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ2Z1bmN0aW9uJztcbn1cblxuZnVuY3Rpb24gaXNOdW1iZXIoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnbnVtYmVyJztcbn1cblxuZnVuY3Rpb24gaXNPYmplY3QoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnb2JqZWN0JyAmJiBhcmcgIT09IG51bGw7XG59XG5cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09PSB2b2lkIDA7XG59XG4iXX0=
