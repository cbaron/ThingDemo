(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

module.exports = {
	Firehose: require('./views/templates/Firehose'),
	Header: require('./views/templates/Header'),
	Home: require('./views/templates/Home'),
	Sidebar: require('./views/templates/Sidebar')
};

},{"./views/templates/Firehose":13,"./views/templates/Header":14,"./views/templates/Home":15,"./views/templates/Sidebar":16}],2:[function(require,module,exports){
'use strict';

module.exports = {
	Firehose: require('./views/Firehose'),
	Header: require('./views/Header'),
	Home: require('./views/Home'),
	Sidebar: require('./views/Sidebar')
};

},{"./views/Firehose":7,"./views/Header":8,"./views/Home":9,"./views/Sidebar":10}],3:[function(require,module,exports){
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

},{"../../lib/MyObject":18}],4:[function(require,module,exports){
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

},{"../.TemplateMap":1,"../.ViewMap":2,"../router":6}],5:[function(require,module,exports){
'use strict';

window.onload = function () {
  return require('./router');
};

},{"./router":6}],6:[function(require,module,exports){
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

},{"../../lib/MyError":17,"./.ViewMap":2,"./factory/View":4}],7:[function(require,module,exports){
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

},{"./__proto__":11}],8:[function(require,module,exports){
'use strict';

module.exports = Object.assign({}, require('./__proto__'), {});

},{"./__proto__":11}],9:[function(require,module,exports){
'use strict';

module.exports = Object.assign({}, require('./__proto__'), {
    size: function size() {
        this.views.firehose.els.container.style.height = this.els.container.clientHeight - this.views.header.els.container.clientHeight + 'px';
        return true;
    }
});

},{"./__proto__":11}],10:[function(require,module,exports){
'use strict';

module.exports = Object.assign({}, require('./__proto__'), {
    getTemplateOptions: function getTemplateOptions() {
        return this.data;
    },


    data: ['Data Revenue', 'Policies', 'Licenses', 'API Schema']

});

},{"./__proto__":11}],11:[function(require,module,exports){
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

},{"../../../lib/MyObject":18,"../Xhr":3,"./lib/OptimizedResize":12,"events":19}],12:[function(require,module,exports){
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

},{}],13:[function(require,module,exports){
"use strict";

module.exports = function (p) {
  return "<div id=\"viz\"></div>";
};

},{}],14:[function(require,module,exports){
"use strict";

module.exports = function (p) {
    return "<div>\n    <span>China Unicom</span>\n    <div>\n        <input data-js=\"from\" type=\"text\" />\n        <span>to</span>\n        <input data-js=\"to\" type=\"text\" />\n    </div>\n</div>";
};

},{}],15:[function(require,module,exports){
"use strict";

module.exports = function (p) {
    return "<div class=\"cleafix\">\n    <div data-view=\"sidebar\"></div>\n    <div class=\"main\">\n        <div data-view=\"header\"></div>\n        <div data-view=\"firehose\"></div>\n    </div>\n</div>";
};

},{}],16:[function(require,module,exports){
'use strict';

module.exports = function (p) {
    var list = p.map(function (item) {
        return '<li><span>logo</span><span>' + item + '</span></li>';
    }).join('');
    return '<div>\n        <div>\n            <span>logo</span>\n            <span>Tellient</span>\n        </div>\n        <div>\n            <span>Search</span>\n            <span>icon</span>\n        </div>\n        <ul>' + list + '</ul>\n    </div>';
};

},{}],17:[function(require,module,exports){
"use strict";

module.exports = function (err) {
  console.log(err.stack || err);
};

},{}],18:[function(require,module,exports){
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

},{"./MyError":17}],19:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjbGllbnQvanMvLlRlbXBsYXRlTWFwLmpzIiwiY2xpZW50L2pzLy5WaWV3TWFwLmpzIiwiY2xpZW50L2pzL1hoci5qcyIsImNsaWVudC9qcy9mYWN0b3J5L1ZpZXcuanMiLCJjbGllbnQvanMvbWFpbi5qcyIsImNsaWVudC9qcy9yb3V0ZXIuanMiLCJjbGllbnQvanMvdmlld3MvRmlyZWhvc2UuanMiLCJjbGllbnQvanMvdmlld3MvSGVhZGVyLmpzIiwiY2xpZW50L2pzL3ZpZXdzL0hvbWUuanMiLCJjbGllbnQvanMvdmlld3MvU2lkZWJhci5qcyIsImNsaWVudC9qcy92aWV3cy9fX3Byb3RvX18uanMiLCJjbGllbnQvanMvdmlld3MvbGliL09wdGltaXplZFJlc2l6ZS5qcyIsImNsaWVudC9qcy92aWV3cy90ZW1wbGF0ZXMvRmlyZWhvc2UuanMiLCJjbGllbnQvanMvdmlld3MvdGVtcGxhdGVzL0hlYWRlci5qcyIsImNsaWVudC9qcy92aWV3cy90ZW1wbGF0ZXMvSG9tZS5qcyIsImNsaWVudC9qcy92aWV3cy90ZW1wbGF0ZXMvU2lkZWJhci5qcyIsImxpYi9NeUVycm9yLmpzIiwibGliL015T2JqZWN0LmpzIiwibm9kZV9tb2R1bGVzL2V2ZW50cy9ldmVudHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBLE9BQU8sT0FBUCxHQUFlO0FBQ2QsV0FBVSxRQUFRLDRCQUFSLENBREk7QUFFZCxTQUFRLFFBQVEsMEJBQVIsQ0FGTTtBQUdkLE9BQU0sUUFBUSx3QkFBUixDQUhRO0FBSWQsVUFBUyxRQUFRLDJCQUFSO0FBSkssQ0FBZjs7Ozs7QUNBQSxPQUFPLE9BQVAsR0FBZTtBQUNkLFdBQVUsUUFBUSxrQkFBUixDQURJO0FBRWQsU0FBUSxRQUFRLGdCQUFSLENBRk07QUFHZCxPQUFNLFFBQVEsY0FBUixDQUhRO0FBSWQsVUFBUyxRQUFRLGlCQUFSO0FBSkssQ0FB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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwibW9kdWxlLmV4cG9ydHM9e1xuXHRGaXJlaG9zZTogcmVxdWlyZSgnLi92aWV3cy90ZW1wbGF0ZXMvRmlyZWhvc2UnKSxcblx0SGVhZGVyOiByZXF1aXJlKCcuL3ZpZXdzL3RlbXBsYXRlcy9IZWFkZXInKSxcblx0SG9tZTogcmVxdWlyZSgnLi92aWV3cy90ZW1wbGF0ZXMvSG9tZScpLFxuXHRTaWRlYmFyOiByZXF1aXJlKCcuL3ZpZXdzL3RlbXBsYXRlcy9TaWRlYmFyJylcbn0iLCJtb2R1bGUuZXhwb3J0cz17XG5cdEZpcmVob3NlOiByZXF1aXJlKCcuL3ZpZXdzL0ZpcmVob3NlJyksXG5cdEhlYWRlcjogcmVxdWlyZSgnLi92aWV3cy9IZWFkZXInKSxcblx0SG9tZTogcmVxdWlyZSgnLi92aWV3cy9Ib21lJyksXG5cdFNpZGViYXI6IHJlcXVpcmUoJy4vdmlld3MvU2lkZWJhcicpXG59IiwibW9kdWxlLmV4cG9ydHMgPSBPYmplY3QuY3JlYXRlKCBPYmplY3QuYXNzaWduKCB7fSwgcmVxdWlyZSgnLi4vLi4vbGliL015T2JqZWN0JyksIHtcblxuICAgIFJlcXVlc3Q6IHtcblxuICAgICAgICBjb25zdHJ1Y3RvciggZGF0YSApIHtcbiAgICAgICAgICAgIGxldCByZXEgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKVxuXG4gICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoICggcmVzb2x2ZSwgcmVqZWN0ICkgPT4ge1xuXG4gICAgICAgICAgICAgICAgcmVxLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBbIDUwMCwgNDA0LCA0MDEgXS5pbmNsdWRlcyggdGhpcy5zdGF0dXMgKVxuICAgICAgICAgICAgICAgICAgICAgICAgPyByZWplY3QoIHRoaXMucmVzcG9uc2UgKVxuICAgICAgICAgICAgICAgICAgICAgICAgOiByZXNvbHZlKCBKU09OLnBhcnNlKHRoaXMucmVzcG9uc2UpIClcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiggZGF0YS5tZXRob2QgPT09IFwiZ2V0XCIgfHwgZGF0YS5tZXRob2QgPT09IFwib3B0aW9uc1wiICkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgcXMgPSBkYXRhLnFzID8gYD8ke2RhdGEucXN9YCA6ICcnIFxuICAgICAgICAgICAgICAgICAgICByZXEub3BlbiggZGF0YS5tZXRob2QsIGAvJHtkYXRhLnJlc291cmNlfSR7cXN9YCApXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0SGVhZGVycyggcmVxLCBkYXRhLmhlYWRlcnMgKVxuICAgICAgICAgICAgICAgICAgICByZXEuc2VuZChudWxsKVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJlcS5vcGVuKCBkYXRhLm1ldGhvZCwgYC8ke2RhdGEucmVzb3VyY2V9YCwgdHJ1ZSlcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRIZWFkZXJzKCByZXEsIGRhdGEuaGVhZGVycyApXG4gICAgICAgICAgICAgICAgICAgIHJlcS5zZW5kKCBkYXRhLmRhdGEgKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gKVxuICAgICAgICB9LFxuXG4gICAgICAgIHBsYWluRXNjYXBlKCBzVGV4dCApIHtcbiAgICAgICAgICAgIC8qIGhvdyBzaG91bGQgSSB0cmVhdCBhIHRleHQvcGxhaW4gZm9ybSBlbmNvZGluZz8gd2hhdCBjaGFyYWN0ZXJzIGFyZSBub3QgYWxsb3dlZD8gdGhpcyBpcyB3aGF0IEkgc3VwcG9zZS4uLjogKi9cbiAgICAgICAgICAgIC8qIFwiNFxcM1xcNyAtIEVpbnN0ZWluIHNhaWQgRT1tYzJcIiAtLS0tPiBcIjRcXFxcM1xcXFw3XFwgLVxcIEVpbnN0ZWluXFwgc2FpZFxcIEVcXD1tYzJcIiAqL1xuICAgICAgICAgICAgcmV0dXJuIHNUZXh0LnJlcGxhY2UoL1tcXHNcXD1cXFxcXS9nLCBcIlxcXFwkJlwiKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzZXRIZWFkZXJzKCByZXEsIGhlYWRlcnM9e30gKSB7XG4gICAgICAgICAgICByZXEuc2V0UmVxdWVzdEhlYWRlciggXCJBY2NlcHRcIiwgaGVhZGVycy5hY2NlcHQgfHwgJ2FwcGxpY2F0aW9uL2pzb24nIClcbiAgICAgICAgICAgIHJlcS5zZXRSZXF1ZXN0SGVhZGVyKCBcIkNvbnRlbnQtVHlwZVwiLCBoZWFkZXJzLmNvbnRlbnRUeXBlIHx8ICd0ZXh0L3BsYWluJyApXG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgX2ZhY3RvcnkoIGRhdGEgKSB7XG4gICAgICAgIHJldHVybiBPYmplY3QuY3JlYXRlKCB0aGlzLlJlcXVlc3QsIHsgfSApLmNvbnN0cnVjdG9yKCBkYXRhIClcbiAgICB9LFxuXG4gICAgY29uc3RydWN0b3IoKSB7XG5cbiAgICAgICAgaWYoICFYTUxIdHRwUmVxdWVzdC5wcm90b3R5cGUuc2VuZEFzQmluYXJ5ICkge1xuICAgICAgICAgIFhNTEh0dHBSZXF1ZXN0LnByb3RvdHlwZS5zZW5kQXNCaW5hcnkgPSBmdW5jdGlvbihzRGF0YSkge1xuICAgICAgICAgICAgdmFyIG5CeXRlcyA9IHNEYXRhLmxlbmd0aCwgdWk4RGF0YSA9IG5ldyBVaW50OEFycmF5KG5CeXRlcyk7XG4gICAgICAgICAgICBmb3IgKHZhciBuSWR4ID0gMDsgbklkeCA8IG5CeXRlczsgbklkeCsrKSB7XG4gICAgICAgICAgICAgIHVpOERhdGFbbklkeF0gPSBzRGF0YS5jaGFyQ29kZUF0KG5JZHgpICYgMHhmZjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuc2VuZCh1aThEYXRhKTtcbiAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX2ZhY3RvcnkuYmluZCh0aGlzKVxuICAgIH1cblxufSApLCB7IH0gKS5jb25zdHJ1Y3RvcigpXG4iLCJtb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5jcmVhdGUoIHtcblxuICAgIGNyZWF0ZSggbmFtZSwgb3B0cyApIHtcbiAgICAgICAgY29uc3QgbG93ZXIgPSBuYW1lXG4gICAgICAgIG5hbWUgPSBuYW1lLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgbmFtZS5zbGljZSgxKVxuICAgICAgICByZXR1cm4gT2JqZWN0LmNyZWF0ZShcbiAgICAgICAgICAgIHRoaXMuVmlld3NbIG5hbWUgXSxcbiAgICAgICAgICAgIE9iamVjdC5hc3NpZ24oIHtcbiAgICAgICAgICAgICAgICBuYW1lOiB7IHZhbHVlOiBuYW1lIH0sXG4gICAgICAgICAgICAgICAgZmFjdG9yeTogeyB2YWx1ZTogdGhpcyB9LFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlOiB7IHZhbHVlOiB0aGlzLlRlbXBsYXRlc1sgbmFtZSBdIH0sXG4gICAgICAgICAgICAgICAgdXNlcjogeyB2YWx1ZTogdGhpcy5Vc2VyIH0sXG4gICAgICAgICAgICAgICAgVmlld3M6IHsgdmFsdWU6IHsgfSB9XG4gICAgICAgICAgICAgICAgfSwgb3B0cyApXG4gICAgICAgICkuY29uc3RydWN0b3IoKVxuICAgICAgICAub24oICduYXZpZ2F0ZScsIHJvdXRlID0+IHJlcXVpcmUoJy4uL3JvdXRlcicpLm5hdmlnYXRlKCByb3V0ZSApIClcbiAgICAgICAgLm9uKCAnZGVsZXRlZCcsICgpID0+IGRlbGV0ZSAocmVxdWlyZSgnLi4vcm91dGVyJykpLnZpZXdzW2xvd2VyXSApXG4gICAgfSxcblxufSwge1xuICAgIFRlbXBsYXRlczogeyB2YWx1ZTogcmVxdWlyZSgnLi4vLlRlbXBsYXRlTWFwJykgfSxcbiAgICBWaWV3czogeyB2YWx1ZTogcmVxdWlyZSgnLi4vLlZpZXdNYXAnKSB9XG59IClcbiIsIndpbmRvdy5vbmxvYWQgPSAoKSA9PiByZXF1aXJlKCcuL3JvdXRlcicpXG4iLCJtb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5jcmVhdGUoIHtcblxuICAgIEVycm9yOiByZXF1aXJlKCcuLi8uLi9saWIvTXlFcnJvcicpLFxuICAgIFxuICAgIFZpZXdGYWN0b3J5OiByZXF1aXJlKCcuL2ZhY3RvcnkvVmlldycpLFxuICAgIFxuICAgIFZpZXdzOiByZXF1aXJlKCcuLy5WaWV3TWFwJyksXG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5jb250ZW50Q29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2NvbnRlbnQnKVxuXG4gICAgICAgIHdpbmRvdy5vbnBvcHN0YXRlID0gdGhpcy5oYW5kbGUuYmluZCh0aGlzKVxuXG4gICAgICAgIHRoaXMuaGFuZGxlKClcblxuICAgICAgICByZXR1cm4gdGhpc1xuICAgIH0sXG5cbiAgICBoYW5kbGUoKSB7XG4gICAgICAgIHRoaXMuaGFuZGxlciggd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLnNwbGl0KCcvJykuc2xpY2UoMSkgKVxuICAgIH0sXG5cbiAgICBoYW5kbGVyKCBwYXRoICkge1xuICAgICAgICBjb25zdCB2aWV3ID0gdGhpcy5WaWV3c1sgcGF0aFswXSBdID8gcGF0aFswXSA6ICdob21lJztcblxuICAgICAgICAoICggdmlldyA9PT0gdGhpcy5jdXJyZW50VmlldyApXG4gICAgICAgICAgICA/IFByb21pc2UucmVzb2x2ZSgpXG4gICAgICAgICAgICA6IFByb21pc2UuYWxsKCBPYmplY3Qua2V5cyggdGhpcy52aWV3cyApLm1hcCggdmlldyA9PiB0aGlzLnZpZXdzWyB2aWV3IF0uaGlkZSgpICkgKSApIFxuICAgICAgICAudGhlbiggKCkgPT4ge1xuXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRWaWV3ID0gdmlld1xuXG4gICAgICAgICAgICBpZiggdGhpcy52aWV3c1sgdmlldyBdICkgcmV0dXJuIHRoaXMudmlld3NbIHZpZXcgXS5vbk5hdmlnYXRpb24oIHBhdGggKVxuXG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKFxuICAgICAgICAgICAgICAgIHRoaXMudmlld3NbIHZpZXcgXSA9XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuVmlld0ZhY3RvcnkuY3JlYXRlKCB2aWV3LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbnNlcnRpb246IHsgdmFsdWU6IHsgZWw6IHRoaXMuY29udGVudENvbnRhaW5lciB9IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXRoOiB7IHZhbHVlOiBwYXRoLCB3cml0YWJsZTogdHJ1ZSB9XG4gICAgICAgICAgICAgICAgICAgIH0gKVxuICAgICAgICAgICAgKVxuICAgICAgICB9IClcbiAgICAgICAgLmNhdGNoKCB0aGlzLkVycm9yIClcbiAgICB9LFxuXG4gICAgbmF2aWdhdGUoIGxvY2F0aW9uICkge1xuICAgICAgICBoaXN0b3J5LnB1c2hTdGF0ZSgge30sICcnLCBsb2NhdGlvbiApXG4gICAgICAgIHRoaXMuaGFuZGxlKClcbiAgICB9XG5cbn0sIHsgY3VycmVudFZpZXc6IHsgdmFsdWU6ICcnLCB3cml0YWJsZTogdHJ1ZSB9LCB2aWV3czogeyB2YWx1ZTogeyB9IH0gfSApLmNvbnN0cnVjdG9yKClcbiIsIm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmFzc2lnbigge30sIHJlcXVpcmUoJy4vX19wcm90b19fJyksIHtcblxuICAgICAvL1RoaXMgY2hhbmdlcyB0aGUgc2l6ZSBvZiB0aGUgY29tcG9uZW50IGJ5IGFkanVzdGluZyB0aGUgcmFkaXVzIGFuZCB3aWR0aC9oZWlnaHQ7XG4gICAgY2hhbmdlU2l6ZSggdywgaCApIHtcbiAgICAgICAgdGhpcy52aXpfY29udGFpbmVyLnRyYW5zaXRpb24oKS5kdXJhdGlvbigzMDApLnN0eWxlKCd3aWR0aCcsIHcgKyAncHgnKS5zdHlsZSgnaGVpZ2h0JywgaCArICdweCcpO1xuICAgICAgICB0aGlzLnZpei53aWR0aCh3KS5oZWlnaHQoaCouOCkudXBkYXRlKCk7XG4gICAgfSxcblxuICAgIC8vVGhpcyBzZXRzIHRoZSBzYW1lIHZhbHVlIGZvciBlYWNoIHJhZGlhbCBwcm9ncmVzc1xuICAgIGNoYW5nZURhdGEoIHZhbCApIHtcbiAgICAgICAgdGhpcy52YWx1ZUZpZWxkID0gdGhpcy52YWx1ZUZpZWxkc1sgTnVtYmVyKHZhbCkgXTtcbiAgICAgICAgdGhpcy52aXoudXBkYXRlKCk7XG4gICAgfSxcblxuICAgIC8vVGhpcyBmdW5jdGlvbiBpcyBjYWxsZWQgd2hlbiB0aGUgdXNlciBzZWxlY3RzIGEgZGlmZmVyZW50IHNraW4uXG4gICAgY2hhbmdlU2tpbiggdmFsICkge1xuICAgICAgICBpZiAodmFsID09IFwiTm9uZVwiKSB7XG4gICAgICAgICAgICB0aGlzLnRoZW1lLnJlbGVhc2UoKVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy50aGVtZS52aXoodml6KVxuICAgICAgICAgICAgdGhpcy50aGVtZS5za2luKHZhbClcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMudml6KCkudXBkYXRlKCk7ICAvL1dlIGNvdWxkIHVzZSB0aGVtZS5hcHBseSgpIGhlcmUsIGJ1dCB3ZSB3YW50IHRvIHRyaWdnZXIgdGhlIHR3ZWVuLlxuICAgIH0sXG5cbiAgICAvLyBUaGlzIGZ1bmN0aW9uIHVzZXMgdGhlIGFib3ZlIGh0bWwgdGVtcGxhdGUgdG8gcmVwbGFjZSB2YWx1ZXMgYW5kIHRoZW4gY3JlYXRlcyBhIG5ldyA8ZGl2PiB0aGF0IGl0IGFwcGVuZHMgdG8gdGhlXG4gICAgLy8gZG9jdW1lbnQuYm9keS4gIFRoaXMgaXMganVzdCBvbmUgd2F5IHlvdSBjb3VsZCBpbXBsZW1lbnQgYSBkYXRhIHRpcC5cbiAgICBjcmVhdGVEYXRhVGlwKCB4LHksaDEsaDIsaDMgKSB7XG5cbiAgICAgICAgdmFyIGh0bWwgPSB0aGlzLmRhdGF0aXAucmVwbGFjZShcIkhFQURFUjFcIiwgaDEpO1xuICAgICAgICBodG1sID0gaHRtbC5yZXBsYWNlKFwiSEVBREVSMlwiLCBoMik7XG4gICAgICAgIGh0bWwgPSBodG1sLnJlcGxhY2UoXCJIRUFERVIzXCIsIGgzKTtcblxuICAgICAgICBkMy5zZWxlY3QoXCJib2R5XCIpXG4gICAgICAgICAgICAuYXBwZW5kKFwiZGl2XCIpXG4gICAgICAgICAgICAuYXR0cihcImNsYXNzXCIsIFwidnotd2VpZ2h0ZWRfdHJlZS10aXBcIilcbiAgICAgICAgICAgIC5zdHlsZShcInBvc2l0aW9uXCIsIFwiYWJzb2x1dGVcIilcbiAgICAgICAgICAgIC5zdHlsZShcInRvcFwiLCB5ICsgXCJweFwiKVxuICAgICAgICAgICAgLnN0eWxlKFwibGVmdFwiLCAoeCAtIDEyNSkgKyBcInB4XCIpXG4gICAgICAgICAgICAuc3R5bGUoXCJvcGFjaXR5XCIsMClcbiAgICAgICAgICAgIC5odG1sKGh0bWwpXG4gICAgICAgICAgICAudHJhbnNpdGlvbigpLnN0eWxlKFwib3BhY2l0eVwiLDEpO1xuICAgIH0sXG5cbiAgICBkYXRhdGlwOiBgPGRpdiBjbGFzcz1cInRvb2x0aXBcIiBzdHlsZT1cIndpZHRoOiAyNTBweDsgYmFja2dyb3VuZC1vcGFjaXR5Oi41XCI+YCArXG4gICAgICAgICAgICAgYDxkaXYgY2xhc3M9XCJoZWFkZXIxXCI+SEVBREVSMTwvZGl2PmAgK1xuICAgICAgICAgICAgIGA8ZGl2IGNsYXNzPVwiaGVhZGVyLXJ1bGVcIj48L2Rpdj5gICtcbiAgICAgICAgICAgICBgPGRpdiBjbGFzcz1cImhlYWRlcjJcIj4gSEVBREVSMiA8L2Rpdj5gICtcbiAgICAgICAgICAgICBgPGRpdiBjbGFzcz1cImhlYWRlci1ydWxlXCI+PC9kaXY+YCArXG4gICAgICAgICAgICAgYDxkaXYgY2xhc3M9XCJoZWFkZXIzXCI+IEhFQURFUjMgPC9kaXY+YCArXG4gICAgICAgICAgICAgYDwvZGl2PmAsXG5cbiAgICBmb3JtYXRDdXJyZW5jeShkKSB7XG4gICAgICAgIGlmIChpc05hTihkKSkgZCA9IDA7IHJldHVybiBcIiRcIiArIGQzLmZvcm1hdChcIiwuMmZcIikoZCkgKyBcIiBCaWxsaW9uXCI7XG4gICAgIH0sXG5cbiAgICBpbml0aWFsaXplKCkge1xuICAgICAgICB0aGlzLnZpeiA9IHZpenVseS52aXoud2VpZ2h0ZWRfdHJlZSggdGhpcy5lbHMuY29udGFpbmVyIClcblxuICAgICAgICAvL0hlcmUgd2UgY3JlYXRlIHRocmVlIHZpenVseSB0aGVtZXMgZm9yIGVhY2ggcmFkaWFsIHByb2dyZXNzIGNvbXBvbmVudC5cbiAgICAgICAgLy9BIHRoZW1lIG1hbmFnZXMgdGhlIGxvb2sgYW5kIGZlZWwgb2YgdGhlIGNvbXBvbmVudCBvdXRwdXQuICBZb3UgY2FuIG9ubHkgaGF2ZVxuICAgICAgICAvL29uZSBjb21wb25lbnQgYWN0aXZlIHBlciB0aGVtZSwgc28gd2UgYmluZCBlYWNoIHRoZW1lIHRvIHRoZSBjb3JyZXNwb25kaW5nIGNvbXBvbmVudC5cbiAgICAgICAgdGhpcy50aGVtZSA9XG4gICAgICAgICAgICB2aXp1bHkudGhlbWUud2VpZ2h0ZWRfdHJlZSggdGhpcy52aXopXG4gICAgICAgICAgICAgICAgICAgICAgICAuc2tpbih2aXp1bHkuc2tpbi5XRUlHSFRFRF9UUkVFX0FYSUlTKVxuXG4gICAgICAgIC8vTGlrZSBEMyBhbmQgalF1ZXJ5LCB2aXp1bHkgdXNlcyBhIGZ1bmN0aW9uIGNoYWluaW5nIHN5bnRheCB0byBzZXQgY29tcG9uZW50IHByb3BlcnRpZXNcbiAgICAgICAgLy9IZXJlIHdlIHNldCBzb21lIGJhc2VzIGxpbmUgcHJvcGVydGllcyBmb3IgYWxsIHRocmVlIGNvbXBvbmVudHMuXG4gICAgICAgIHRoaXMudml6LmRhdGEodGhpcy5kYXRhKVxuICAgICAgICAgICAgICAgIC53aWR0aCh0aGlzLmVscy5jb250YWluZXIuY2xpZW50V2lkdGgpIFxuICAgICAgICAgICAgICAgIC5oZWlnaHQodGhpcy5lbHMuY29udGFpbmVyLmNsaWVudEhlaWdodClcbiAgICAgICAgICAgICAgICAuY2hpbGRyZW4oIGQgPT4gZC52YWx1ZXMgKVxuICAgICAgICAgICAgICAgIC5rZXkoIGQgPT4gZC5pZCApXG4gICAgICAgICAgICAgICAgLnZhbHVlKCBkID0+IE51bWJlciggZFsgYGFnZ18ke3RoaXMudmFsdWVGaWVsZH1gIF0gKSApXG4gICAgICAgICAgICAgICAgLmZpeGVkU3BhbigtMSlcbiAgICAgICAgICAgICAgICAubGFiZWwoIGQgPT4gdGhpcy50cmltTGFiZWwoIGQua2V5IHx8IChkWyBgTGV2ZWwke2QuZGVwdGh9YCBdICkgKSApXG4gICAgICAgICAgICAgICAgLm9uKCBcIm1lYXN1cmVcIiwgdGhpcy5vbk1lYXN1cmUuYmluZCh0aGlzKSApXG4gICAgICAgICAgICAgICAgLm9uKCBcIm1vdXNlb3ZlclwiLCB0aGlzLm9uTW91c2VPdmVyLmJpbmQodGhpcykgKVxuICAgICAgICAgICAgICAgIC5vbiggXCJtb3VzZW91dFwiLCB0aGlzLm9uTW91c2VPdXQuYmluZCh0aGlzKSApXG4gICAgICAgICAgICAgICAgLm9uKCBcImNsaWNrXCIsIHRoaXMub25DbGljay5iaW5kKHRoaXMpIClcblxuICAgICAgICAvL1dlIHVzZSB0aGlzIGZ1bmN0aW9uIHRvIHNpemUgdGhlIGNvbXBvbmVudHMgYmFzZWQgb24gdGhlIHNlbGVjdGVkIHZhbHVlIGZyb20gdGhlIFJhZGlhTFByb2dyZXNzVGVzdC5odG1sIHBhZ2UuXG4gICAgICAgIHRoaXMuY2hhbmdlU2l6ZSggdGhpcy5lbHMuY29udGFpbmVyLmNsaWVudFdpZHRoLCB0aGlzLmVscy5jb250YWluZXIuY2xpZW50SGVpZ2h0IClcbiAgICAgICAgdGhpcy5pbml0aWFsaXplZCA9IHRydWVcblxuICAgICAgICAvLyBPcGVuIHVwIHNvbWUgb2YgdGhlIHRyZWUgYnJhbmNoZXMuXG4gICAgICAgIHRoaXMudml6LnRvZ2dsZU5vZGUodGhpcy5kYXRhLnZhbHVlc1syXSk7XG4gICAgICAgIHRoaXMudml6LnRvZ2dsZU5vZGUodGhpcy5kYXRhLnZhbHVlc1syXS52YWx1ZXNbMF0pO1xuICAgICAgICB0aGlzLnZpei50b2dnbGVOb2RlKHRoaXMuZGF0YS52YWx1ZXNbM10pO1xuICAgIH0sXG5cbiAgICBsb2FkRGF0YSgpIHtcbiAgICAgICAgZDMuY3N2KFwiL3N0YXRpYy9kYXRhL3dlaWdodGVkdHJlZV9mZWRlcmFsX2J1ZGdldC5jc3ZcIiwgY3N2ID0+IHtcbiAgICAgICAgICAgIHRoaXMuZGF0YS52YWx1ZXMgPSB0aGlzLnByZXBEYXRhKCBjc3YgKVxuICAgICAgICAgICAgdGhpcy5pbml0aWFsaXplKClcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIG9uTWVhc3VyZSgpIHtcbiAgICAgICAvLyBBbGxvd3MgeW91IHRvIG1hbnVhbGx5IG92ZXJyaWRlIHZlcnRpY2FsIHNwYWNpbmdcbiAgICAgICAvLyB2aXoudHJlZSgpLm5vZGVTaXplKFsxMDAsMF0pO1xuICAgIH0sXG5cbiAgICBvbk1vdXNlT3ZlcihlLGQsaSkge1xuICAgICAgICBpZiAoZCA9PSB0aGlzLmRhdGEpIHJldHVybjtcbiAgICAgICAgdmFyIHJlY3QgPSBlLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICBpZiAoZC50YXJnZXQpIGQgPSBkLnRhcmdldDsgLy9UaGlzIGlmIGZvciBsaW5rIGVsZW1lbnRzXG4gICAgICAgIHRoaXMuY3JlYXRlRGF0YVRpcChyZWN0LmxlZnQsIHJlY3QudG9wLCAoZC5rZXkgfHwgKGRbJ0xldmVsJyArIGQuZGVwdGhdKSksIHRoaXMuZm9ybWF0Q3VycmVuY3koZFtcImFnZ19cIiArIHRoaXMudmFsdWVGaWVsZF0pLCB0aGlzLnZhbHVlRmllbGQpO1xuICAgIH0sXG5cbiAgICAgb25Nb3VzZU91dChlLGQsaSkge1xuICAgICAgICBkMy5zZWxlY3RBbGwoXCIudnotd2VpZ2h0ZWRfdHJlZS10aXBcIikucmVtb3ZlKCk7XG4gICAgfSxcblxuICAgLy9XZSBjYW4gY2FwdHVyZSBjbGljayBldmVudHMgYW5kIHJlc3BvbmQgdG8gdGhlbVxuICAgIG9uQ2xpY2soZSxkLGkpIHtcbiAgICAgICAgdml6LnRvZ2dsZU5vZGUoZCk7XG4gICAgfSxcblxuICAgIHBvc3RSZW5kZXIoKSB7XG4gICAgICAgIC8vIGh0bWwgZWxlbWVudCB0aGF0IGhvbGRzIHRoZSBjaGFydFxuICAgICAgICB0aGlzLnZpel9jb250YWluZXIgPSB1bmRlZmluZWRcblxuICAgICAgICAvLyBvdXIgd2VpZ2h0ZWQgdHJlZVxuICAgICAgICB0aGlzLnZpeiA9IHVuZGVmaW5lZFxuXG4gICAgICAgIC8vIG91ciB0aGVtZVxuICAgICAgICB0aGlzLnRoZW1lID0gdW5kZWZpbmVkXG5cbiAgICAgICAgLy8gbmVzdGVkIGRhdGFcbiAgICAgICAgdGhpcy5kYXRhID0ge31cblxuICAgICAgICAvLyBzdG9yZXMgdGhlIGN1cnJlbnRseSBzZWxlY3RlZCB2YWx1ZSBmaWVsZFxuICAgICAgICB0aGlzLnZhbHVlRmllbGQgPSBcIkZlZGVyYWxcIjtcbiAgICAgICAgdGhpcy52YWx1ZUZpZWxkcyA9IFtcIkZlZGVyYWxcIiwgXCJTdGF0ZVwiLCBcIkxvY2FsXCJdO1xuXG4gICAgICAgIC8vIFNldCB0aGUgc2l6ZSBvZiBvdXIgY29udGFpbmVyIGVsZW1lbnQuXG4gICAgICAgIHRoaXMudml6X2NvbnRhaW5lciA9IGQzLnNlbGVjdEFsbChcIiN2aXpcIilcblxuICAgICAgICB0aGlzLmxvYWREYXRhKCk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXNcbiAgICB9LFxuXG4gICAgcHJlcERhdGEoIGNzdiApIHtcblxuICAgICAgICB2YXIgdmFsdWVzPVtdO1xuXG4gICAgICAgIC8vQ2xlYW4gZmVkZXJhbCBidWRnZXQgZGF0YSBhbmQgcmVtb3ZlIGFsbCByb3dzIHdoZXJlIGFsbCB2YWx1ZXMgYXJlIHplcm8gb3Igbm8gbGFiZWxzXG4gICAgICAgIGNzdi5mb3JFYWNoKCBkID0+IHtcbiAgICAgICAgICAgIGlmKCB0aGlzLnZhbHVlRmllbGRzLnJlZHVjZSggKCBtZW1vLCBjdXIgKSA9PiBtZW1vICsgTnVtYmVyKCBkWyBjdXIgXSApLCAwICkgPiAwICkgdmFsdWVzLnB1c2goIGQgKVxuICAgICAgICB9IClcblxuICAgICAgICAvL01ha2Ugb3VyIGRhdGEgaW50byBhIG5lc3RlZCB0cmVlLiAgSWYgeW91IGFscmVhZHkgaGF2ZSBhIG5lc3RlZCBzdHJ1Y3R1cmUgeW91IGRvbid0IG5lZWQgdG8gZG8gdGhpcy5cbiAgICAgICAgdmFyIG5lc3QgPSBkMy5uZXN0KClcbiAgICAgICAgICAgIC5rZXkoIGQgPT4gZC5MZXZlbDEgKVxuICAgICAgICAgICAgLmtleSggZCA9PiBkLkxldmVsMiApXG4gICAgICAgICAgICAua2V5KCBkID0+IGQuTGV2ZWwzIClcbiAgICAgICAgICAgIC5lbnRyaWVzKHZhbHVlcylcblxuICAgICAgICAvL1RoaXMgd2lsbCBiZSBhIHZpei5kYXRhIGZ1bmN0aW9uO1xuICAgICAgICB2aXp1bHkuZGF0YS5hZ2dyZWdhdGVOZXN0KCBuZXN0LCB0aGlzLnZhbHVlRmllbGRzLCAoIGEsIGIgKSA9PiBOdW1iZXIoYSkgKyBOdW1iZXIoYikgKVxuXG4gICAgICAgIHZhciBub2RlPXt9O1xuICAgICAgICBub2RlLnZhbHVlcyA9IG5lc3Q7XG4gICAgICAgIHRoaXMucmVtb3ZlRW1wdHlOb2Rlcyhub2RlLFwiMFwiLFwiMFwiKTtcblxuICAgICAgICByZXR1cm4gbmVzdDtcbiAgICB9LFxuXG4gICAgLy9SZW1vdmUgZW1wdHkgY2hpbGQgbm9kZXMgbGVmdCBhdCBlbmQgb2YgYWdncmVnYXRpb24gYW5kIGFkZCB1bnFpdWUgaWRzXG4gICAgcmVtb3ZlRW1wdHlOb2Rlcyggbm9kZSwgcGFyZW50SWQsIGNoaWxkSWQgKSB7XG4gICAgICAgIGlmICghbm9kZSkgcmV0dXJuXG4gICAgICAgIG5vZGUuaWQgPSBgJHtwYXJlbnRJZH1fJHtjaGlsZElkfWBcbiAgICAgICAgaWYgKG5vZGUudmFsdWVzKSB7XG4gICAgICAgICAgICBmb3IodmFyIGkgPSBub2RlLnZhbHVlcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICAgICAgICAgIG5vZGUuaWQ9cGFyZW50SWQgKyBcIl9cIiArIGk7XG4gICAgICAgICAgICAgICAgaWYoIW5vZGUudmFsdWVzW2ldLmtleSAmJiAhbm9kZS52YWx1ZXNbaV0uTGV2ZWw0KSB7XG4gICAgICAgICAgICAgICAgICAgIG5vZGUudmFsdWVzLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlRW1wdHlOb2Rlcyhub2RlLnZhbHVlc1tpXSxub2RlLmlkLGkpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIHNpemUoKSB7XG4gICAgICAgIGlmKCB0aGlzLmluaXRpYWxpemVkICkgdGhpcy5jaGFuZ2VTaXplKCB0aGlzLmVscy5jb250YWluZXIuY2xpZW50V2lkdGgsIHRoaXMuZWxzLmNvbnRhaW5lci5jbGllbnRIZWlnaHQgKVxuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgIH0sXG5cbiAgICB0cmltTGFiZWwgKGxhYmVsKSB7XG4gICAgICAgcmV0dXJuIChTdHJpbmcobGFiZWwpLmxlbmd0aCA+IDIwKSA/IFN0cmluZyhsYWJlbCkuc3Vic3RyKDAsIDE3KSArIFwiLi4uXCIgOiBsYWJlbFxuICAgIH1cblxufSApXG4iLCJtb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5hc3NpZ24oIHt9LCByZXF1aXJlKCcuL19fcHJvdG9fXycpLCB7XG59IClcbiIsIm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmFzc2lnbigge30sIHJlcXVpcmUoJy4vX19wcm90b19fJyksIHtcbiAgICBcbiAgICBzaXplKCkge1xuICAgICAgICB0aGlzLnZpZXdzLmZpcmVob3NlLmVscy5jb250YWluZXIuc3R5bGUuaGVpZ2h0ID0gYCR7dGhpcy5lbHMuY29udGFpbmVyLmNsaWVudEhlaWdodCAtIHRoaXMudmlld3MuaGVhZGVyLmVscy5jb250YWluZXIuY2xpZW50SGVpZ2h0fXB4YFxuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cbn0gKVxuIiwibW9kdWxlLmV4cG9ydHMgPSBPYmplY3QuYXNzaWduKCB7fSwgcmVxdWlyZSgnLi9fX3Byb3RvX18nKSwge1xuXG4gICAgZ2V0VGVtcGxhdGVPcHRpb25zKCkgeyByZXR1cm4gdGhpcy5kYXRhIH0sXG5cbiAgICBkYXRhOiBbICdEYXRhIFJldmVudWUnLCAnUG9saWNpZXMnLCAnTGljZW5zZXMnLCAnQVBJIFNjaGVtYScgXVxuXG59IClcbiIsIm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmFzc2lnbiggeyB9LCByZXF1aXJlKCcuLi8uLi8uLi9saWIvTXlPYmplY3QnKSwgcmVxdWlyZSgnZXZlbnRzJykuRXZlbnRFbWl0dGVyLnByb3RvdHlwZSwge1xuXG4gICAgT3B0aW1pemVkUmVzaXplOiByZXF1aXJlKCcuL2xpYi9PcHRpbWl6ZWRSZXNpemUnKSxcbiAgICBcbiAgICBYaHI6IHJlcXVpcmUoJy4uL1hocicpLFxuXG4gICAgYmluZEV2ZW50KCBrZXksIGV2ZW50ICkge1xuICAgICAgICB2YXIgZWxzID0gQXJyYXkuaXNBcnJheSggdGhpcy5lbHNbIGtleSBdICkgPyB0aGlzLmVsc1sga2V5IF0gOiBbIHRoaXMuZWxzWyBrZXkgXSBdXG4gICAgICAgIGVscy5mb3JFYWNoKCBlbCA9PiBlbC5hZGRFdmVudExpc3RlbmVyKCBldmVudCB8fCAnY2xpY2snLCBlID0+IHRoaXNbIGBvbiR7dGhpcy5jYXBpdGFsaXplRmlyc3RMZXR0ZXIoa2V5KX0ke3RoaXMuY2FwaXRhbGl6ZUZpcnN0TGV0dGVyKGV2ZW50KX1gIF0oIGUgKSApIClcbiAgICB9LFxuXG4gICAgY2FwaXRhbGl6ZUZpcnN0TGV0dGVyOiBzdHJpbmcgPT4gc3RyaW5nLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgc3RyaW5nLnNsaWNlKDEpLFxuXG4gICAgY29uc3RydWN0b3IoKSB7XG5cblxuICAgICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbiggdGhpcywgeyBlbHM6IHsgfSwgc2x1cnA6IHsgYXR0cjogJ2RhdGEtanMnLCB2aWV3OiAnZGF0YS12aWV3JyB9LCB2aWV3czogeyB9IH0gKS5yZW5kZXIoKVxuICAgIH0sXG5cbiAgICBkZWxlZ2F0ZUV2ZW50cygga2V5LCBlbCApIHtcbiAgICAgICAgdmFyIHR5cGUgPSB0eXBlb2YgdGhpcy5ldmVudHNba2V5XVxuXG4gICAgICAgIGlmKCB0eXBlID09PSBcInN0cmluZ1wiICkgeyB0aGlzLmJpbmRFdmVudCgga2V5LCB0aGlzLmV2ZW50c1trZXldICkgfVxuICAgICAgICBlbHNlIGlmKCBBcnJheS5pc0FycmF5KCB0aGlzLmV2ZW50c1trZXldICkgKSB7XG4gICAgICAgICAgICB0aGlzLmV2ZW50c1sga2V5IF0uZm9yRWFjaCggZXZlbnRPYmogPT4gdGhpcy5iaW5kRXZlbnQoIGtleSwgZXZlbnRPYmouZXZlbnQgKSApXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmJpbmRFdmVudCgga2V5LCB0aGlzLmV2ZW50c1trZXldLmV2ZW50IClcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBkZWxldGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmhpZGUoKVxuICAgICAgICAudGhlbiggKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5lbHMuY29udGFpbmVyLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoIHRoaXMuZWxzLmNvbnRhaW5lciApXG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCB0aGlzLmVtaXQoJ2RlbGV0ZWQnKSApXG4gICAgICAgIH0gKVxuICAgIH0sXG5cbiAgICBldmVudHM6IHt9LFxuXG4gICAgZ2V0RGF0YSgpIHtcbiAgICAgICAgaWYoICF0aGlzLm1vZGVsICkgdGhpcy5tb2RlbCA9IE9iamVjdC5jcmVhdGUoIHRoaXMuTW9kZWwsIHsgcmVzb3VyY2U6IHsgdmFsdWU6IHRoaXMubmFtZSB9IH0gKVxuXG4gICAgICAgIHJldHVybiB0aGlzLm1vZGVsLmdldCgpXG4gICAgfSxcblxuICAgIGdldFRlbXBsYXRlT3B0aW9ucygpIHtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oXG4gICAgICAgICAgICB7fSxcbiAgICAgICAgICAgICh0aGlzLm1vZGVsKSA/IHRoaXMubW9kZWwuZGF0YSA6IHt9ICxcbiAgICAgICAgICAgIHsgdXNlcjogKHRoaXMudXNlcikgPyB0aGlzLnVzZXIuZGF0YSA6IHt9IH0sXG4gICAgICAgICAgICB7IG9wdHM6ICh0aGlzLnRlbXBsYXRlT3B0cykgPyB0aGlzLnRlbXBsYXRlT3B0cyA6IHt9IH1cbiAgICAgICAgKVxuICAgIH0sXG5cbiAgICBoaWRlKCkge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoIHJlc29sdmUgPT4ge1xuICAgICAgICAgICAgaWYoICFkb2N1bWVudC5ib2R5LmNvbnRhaW5zKHRoaXMuZWxzLmNvbnRhaW5lcikgfHwgdGhpcy5pc0hpZGRlbigpICkgcmV0dXJuIHJlc29sdmUoKVxuICAgICAgICAgICAgdGhpcy5vbkhpZGRlblByb3h5ID0gZSA9PiB0aGlzLm9uSGlkZGVuKHJlc29sdmUpXG4gICAgICAgICAgICB0aGlzLmVscy5jb250YWluZXIuYWRkRXZlbnRMaXN0ZW5lciggJ3RyYW5zaXRpb25lbmQnLCB0aGlzLm9uSGlkZGVuUHJveHkgKVxuICAgICAgICAgICAgdGhpcy5lbHMuY29udGFpbmVyLmNsYXNzTGlzdC5hZGQoJ2hpZGUnKVxuICAgICAgICB9IClcbiAgICB9LFxuXG4gICAgaHRtbFRvRnJhZ21lbnQoIHN0ciApIHtcbiAgICAgICAgbGV0IHJhbmdlID0gZG9jdW1lbnQuY3JlYXRlUmFuZ2UoKTtcbiAgICAgICAgLy8gbWFrZSB0aGUgcGFyZW50IG9mIHRoZSBmaXJzdCBkaXYgaW4gdGhlIGRvY3VtZW50IGJlY29tZXMgdGhlIGNvbnRleHQgbm9kZVxuICAgICAgICByYW5nZS5zZWxlY3ROb2RlKGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiZGl2XCIpLml0ZW0oMCkpXG4gICAgICAgIHJldHVybiByYW5nZS5jcmVhdGVDb250ZXh0dWFsRnJhZ21lbnQoIHN0ciApXG4gICAgfSxcbiAgICBcbiAgICBpc0hpZGRlbigpIHsgcmV0dXJuIHRoaXMuZWxzLmNvbnRhaW5lci5jbGFzc0xpc3QuY29udGFpbnMoJ2hpZGRlbicpIH0sXG5cbiAgICBvbkhpZGRlbiggcmVzb2x2ZSApIHtcbiAgICAgICAgdGhpcy5lbHMuY29udGFpbmVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoICd0cmFuc2l0aW9uZW5kJywgdGhpcy5vbkhpZGRlblByb3h5IClcbiAgICAgICAgdGhpcy5lbHMuY29udGFpbmVyLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpXG4gICAgICAgIHJlc29sdmUoIHRoaXMuZW1pdCgnaGlkZGVuJykgKVxuICAgIH0sXG5cbiAgICBvbkxvZ2luKCkge1xuICAgICAgICBPYmplY3QuYXNzaWduKCB0aGlzLCB7IGVsczogeyB9LCBzbHVycDogeyBhdHRyOiAnZGF0YS1qcycsIHZpZXc6ICdkYXRhLXZpZXcnIH0sIHZpZXdzOiB7IH0gfSApLnJlbmRlcigpXG4gICAgfSxcblxuICAgIG9uU2hvd24oIHJlc29sdmUgKSB7XG4gICAgICAgIHRoaXMuZWxzLmNvbnRhaW5lci5yZW1vdmVFdmVudExpc3RlbmVyKCAndHJhbnNpdGlvbmVuZCcsIHRoaXMub25TaG93blByb3h5IClcbiAgICAgICAgaWYoIHRoaXMuc2l6ZSApIHRoaXMuc2l6ZSgpXG4gICAgICAgIHJlc29sdmUoIHRoaXMuZW1pdCgnc2hvd24nKSApXG4gICAgfSxcblxuICAgIHNob3dOb0FjY2VzcygpIHtcbiAgICAgICAgYWxlcnQoXCJObyBwcml2aWxlZ2VzLCBzb25cIilcbiAgICAgICAgcmV0dXJuIHRoaXNcbiAgICB9LFxuXG4gICAgcG9zdFJlbmRlcigpIHsgcmV0dXJuIHRoaXMgfSxcblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgdGhpcy5zbHVycFRlbXBsYXRlKCB7IHRlbXBsYXRlOiB0aGlzLnRlbXBsYXRlKCB0aGlzLmdldFRlbXBsYXRlT3B0aW9ucygpICksIGluc2VydGlvbjogdGhpcy5pbnNlcnRpb24gfSApXG5cbiAgICAgICAgdGhpcy5yZW5kZXJTdWJ2aWV3cygpXG5cbiAgICAgICAgaWYoIHRoaXMuc2l6ZSApIHsgdGhpcy5zaXplKCk7IHRoaXMuT3B0aW1pemVkUmVzaXplLmFkZCggdGhpcy5zaXplLmJpbmQodGhpcykgKSB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMucG9zdFJlbmRlcigpXG4gICAgfSxcblxuICAgIHJlbmRlclN1YnZpZXdzKCkge1xuICAgICAgICBPYmplY3Qua2V5cyggdGhpcy5WaWV3cyB8fCB7IH0gKS5mb3JFYWNoKCBrZXkgPT4ge1xuICAgICAgICAgICAgaWYoIHRoaXMuVmlld3NbIGtleSBdLmVsICkge1xuICAgICAgICAgICAgICAgIGxldCBvcHRzID0gdGhpcy5WaWV3c1sga2V5IF0ub3B0c1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIG9wdHMgPSAoIG9wdHMgKVxuICAgICAgICAgICAgICAgICAgICA/IHR5cGVvZiBvcHRzID09PSBcIm9iamVjdFwiXG4gICAgICAgICAgICAgICAgICAgICAgICA/IG9wdHNcbiAgICAgICAgICAgICAgICAgICAgICAgIDogb3B0cygpXG4gICAgICAgICAgICAgICAgICAgIDoge31cblxuICAgICAgICAgICAgICAgIHRoaXMudmlld3NbIGtleSBdID0gdGhpcy5mYWN0b3J5LmNyZWF0ZSgga2V5LCBPYmplY3QuYXNzaWduKCB7IGluc2VydGlvbjogeyB2YWx1ZTogeyBlbDogdGhpcy5WaWV3c1sga2V5IF0uZWwsIG1ldGhvZDogJ2luc2VydEJlZm9yZScgfSB9IH0sIG9wdHMgKSApXG4gICAgICAgICAgICAgICAgdGhpcy5WaWV3c1sga2V5IF0uZWwucmVtb3ZlKClcbiAgICAgICAgICAgICAgICB0aGlzLlZpZXdzWyBrZXkgXS5lbCA9IHVuZGVmaW5lZFxuICAgICAgICAgICAgfVxuICAgICAgICB9IClcblxuICAgICAgICByZXR1cm4gdGhpc1xuICAgIH0sXG5cbiAgICBzaG93KCBkdXJhdGlvbiApIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKCByZXNvbHZlID0+IHtcbiAgICAgICAgICAgIHRoaXMub25TaG93blByb3h5ID0gZSA9PiB0aGlzLm9uU2hvd24ocmVzb2x2ZSlcbiAgICAgICAgICAgIHRoaXMuZWxzLmNvbnRhaW5lci5hZGRFdmVudExpc3RlbmVyKCAndHJhbnNpdGlvbmVuZCcsIHRoaXMub25TaG93blByb3h5IClcbiAgICAgICAgICAgIHRoaXMuZWxzLmNvbnRhaW5lci5jbGFzc0xpc3QucmVtb3ZlKCAnaGlkZScsICdoaWRkZW4nIClcbiAgICAgICAgfSApXG4gICAgfSxcblxuICAgIHNsdXJwRWwoIGVsICkge1xuICAgICAgICB2YXIga2V5ID0gZWwuZ2V0QXR0cmlidXRlKCB0aGlzLnNsdXJwLmF0dHIgKSB8fCAnY29udGFpbmVyJ1xuXG4gICAgICAgIGlmKCBrZXkgPT09ICdjb250YWluZXInICkgZWwuY2xhc3NMaXN0LmFkZCggdGhpcy5uYW1lIClcblxuICAgICAgICB0aGlzLmVsc1sga2V5IF0gPSBBcnJheS5pc0FycmF5KCB0aGlzLmVsc1sga2V5IF0gKVxuICAgICAgICAgICAgPyB0aGlzLmVsc1sga2V5IF0ucHVzaCggZWwgKVxuICAgICAgICAgICAgOiAoIHRoaXMuZWxzWyBrZXkgXSAhPT0gdW5kZWZpbmVkIClcbiAgICAgICAgICAgICAgICA/IFsgdGhpcy5lbHNbIGtleSBdLCBlbCBdXG4gICAgICAgICAgICAgICAgOiBlbFxuXG4gICAgICAgIGVsLnJlbW92ZUF0dHJpYnV0ZSh0aGlzLnNsdXJwLmF0dHIpXG5cbiAgICAgICAgaWYoIHRoaXMuZXZlbnRzWyBrZXkgXSApIHRoaXMuZGVsZWdhdGVFdmVudHMoIGtleSwgZWwgKVxuICAgIH0sXG5cbiAgICBzbHVycFRlbXBsYXRlKCBvcHRpb25zICkge1xuICAgICAgICB2YXIgZnJhZ21lbnQgPSB0aGlzLmh0bWxUb0ZyYWdtZW50KCBvcHRpb25zLnRlbXBsYXRlICksXG4gICAgICAgICAgICBzZWxlY3RvciA9IGBbJHt0aGlzLnNsdXJwLmF0dHJ9XWAsXG4gICAgICAgICAgICB2aWV3U2VsZWN0b3IgPSBgWyR7dGhpcy5zbHVycC52aWV3fV1gXG5cbiAgICAgICAgdGhpcy5zbHVycEVsKCBmcmFnbWVudC5xdWVyeVNlbGVjdG9yKCcqJykgKVxuICAgICAgICBmcmFnbWVudC5xdWVyeVNlbGVjdG9yQWxsKCBgJHtzZWxlY3Rvcn0sICR7dmlld1NlbGVjdG9yfWAgKS5mb3JFYWNoKCBlbCA9PiB7XG4gICAgICAgICAgICBpZiggZWwuaGFzQXR0cmlidXRlKCB0aGlzLnNsdXJwLmF0dHIgKSApIHsgdGhpcy5zbHVycEVsKCBlbCApIH1cbiAgICAgICAgICAgIGVsc2UgaWYoIGVsLmhhc0F0dHJpYnV0ZSggdGhpcy5zbHVycC52aWV3ICkgKSB7XG4gICAgICAgICAgICAgICAgaWYoICEgdGhpcy5WaWV3c1sgZWwuZ2V0QXR0cmlidXRlKHRoaXMuc2x1cnAudmlldykgXSApIHRoaXMuVmlld3NbIGVsLmdldEF0dHJpYnV0ZSh0aGlzLnNsdXJwLnZpZXcpIF0gPSB7IH1cbiAgICAgICAgICAgICAgICB0aGlzLlZpZXdzWyBlbC5nZXRBdHRyaWJ1dGUodGhpcy5zbHVycC52aWV3KSBdLmVsID0gZWxcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSApXG4gICAgICAgICAgXG4gICAgICAgIG9wdGlvbnMuaW5zZXJ0aW9uLm1ldGhvZCA9PT0gJ2luc2VydEJlZm9yZSdcbiAgICAgICAgICAgID8gb3B0aW9ucy5pbnNlcnRpb24uZWwucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoIGZyYWdtZW50LCBvcHRpb25zLmluc2VydGlvbi5lbCApXG4gICAgICAgICAgICA6IG9wdGlvbnMuaW5zZXJ0aW9uLmVsWyBvcHRpb25zLmluc2VydGlvbi5tZXRob2QgfHwgJ2FwcGVuZENoaWxkJyBdKCBmcmFnbWVudCApXG5cbiAgICAgICAgcmV0dXJuIHRoaXNcbiAgICB9XG59IClcbiIsIm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmNyZWF0ZSgge1xuXG4gICAgYWRkKGNhbGxiYWNrKSB7XG4gICAgICAgIGlmKCAhdGhpcy5jYWxsYmFja3MubGVuZ3RoICkgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMub25SZXNpemUuYmluZCh0aGlzKSApXG4gICAgICAgIHRoaXMuY2FsbGJhY2tzLnB1c2goY2FsbGJhY2spXG4gICAgfSxcblxuICAgIG9uUmVzaXplKCkge1xuICAgICAgIGlmKCB0aGlzLnJ1bm5pbmcgKSByZXR1cm5cblxuICAgICAgICB0aGlzLnJ1bm5pbmcgPSB0cnVlXG4gICAgICAgIFxuICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lXG4gICAgICAgICAgICA/IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoIHRoaXMucnVuQ2FsbGJhY2tzLmJpbmQodGhpcykgKVxuICAgICAgICAgICAgOiBzZXRUaW1lb3V0KCB0aGlzLnJ1bkNhbGxiYWNrcywgNjYpXG4gICAgfSxcblxuICAgIHJ1bkNhbGxiYWNrcygpIHtcbiAgICAgICAgdGhpcy5jYWxsYmFja3MgPSB0aGlzLmNhbGxiYWNrcy5maWx0ZXIoIGNhbGxiYWNrID0+IGNhbGxiYWNrKCkgKVxuICAgICAgICB0aGlzLnJ1bm5pbmcgPSBmYWxzZSBcbiAgICB9XG5cbn0sIHsgY2FsbGJhY2tzOiB7IHdyaXRhYmxlOiB0cnVlLCB2YWx1ZTogW10gfSwgcnVubmluZzogeyB3cml0YWJsZTogdHJ1ZSwgdmFsdWU6IGZhbHNlIH0gfSApXG4iLCJtb2R1bGUuZXhwb3J0cyA9IHAgPT4gYDxkaXYgaWQ9XCJ2aXpcIj48L2Rpdj5gXG4iLCJtb2R1bGUuZXhwb3J0cyA9IHAgPT5cbmA8ZGl2PlxuICAgIDxzcGFuPkNoaW5hIFVuaWNvbTwvc3Bhbj5cbiAgICA8ZGl2PlxuICAgICAgICA8aW5wdXQgZGF0YS1qcz1cImZyb21cIiB0eXBlPVwidGV4dFwiIC8+XG4gICAgICAgIDxzcGFuPnRvPC9zcGFuPlxuICAgICAgICA8aW5wdXQgZGF0YS1qcz1cInRvXCIgdHlwZT1cInRleHRcIiAvPlxuICAgIDwvZGl2PlxuPC9kaXY+YFxuIiwibW9kdWxlLmV4cG9ydHMgPSBwID0+IFxuYDxkaXYgY2xhc3M9XCJjbGVhZml4XCI+XG4gICAgPGRpdiBkYXRhLXZpZXc9XCJzaWRlYmFyXCI+PC9kaXY+XG4gICAgPGRpdiBjbGFzcz1cIm1haW5cIj5cbiAgICAgICAgPGRpdiBkYXRhLXZpZXc9XCJoZWFkZXJcIj48L2Rpdj5cbiAgICAgICAgPGRpdiBkYXRhLXZpZXc9XCJmaXJlaG9zZVwiPjwvZGl2PlxuICAgIDwvZGl2PlxuPC9kaXY+YFxuIiwibW9kdWxlLmV4cG9ydHMgPSBwID0+IHtcbiAgICBjb25zdCBsaXN0ID0gcC5tYXAoIGl0ZW0gPT4gYDxsaT48c3Bhbj5sb2dvPC9zcGFuPjxzcGFuPiR7aXRlbX08L3NwYW4+PC9saT5gICkuam9pbignJylcbiAgICByZXR1cm4gYDxkaXY+XG4gICAgICAgIDxkaXY+XG4gICAgICAgICAgICA8c3Bhbj5sb2dvPC9zcGFuPlxuICAgICAgICAgICAgPHNwYW4+VGVsbGllbnQ8L3NwYW4+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgPHNwYW4+U2VhcmNoPC9zcGFuPlxuICAgICAgICAgICAgPHNwYW4+aWNvbjwvc3Bhbj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDx1bD4ke2xpc3R9PC91bD5cbiAgICA8L2Rpdj5gXG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGVyciA9PiB7IGNvbnNvbGUubG9nKCBlcnIuc3RhY2sgfHwgZXJyICkgfVxuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgICBFcnJvcjogcmVxdWlyZSgnLi9NeUVycm9yJyksXG5cbiAgICBQOiAoIGZ1biwgYXJncz1bIF0sIHRoaXNBcmcgKSA9PlxuICAgICAgICBuZXcgUHJvbWlzZSggKCByZXNvbHZlLCByZWplY3QgKSA9PiBSZWZsZWN0LmFwcGx5KCBmdW4sIHRoaXNBcmcgfHwgdGhpcywgYXJncy5jb25jYXQoICggZSwgLi4uY2FsbGJhY2sgKSA9PiBlID8gcmVqZWN0KGUpIDogcmVzb2x2ZShjYWxsYmFjaykgKSApICksXG4gICAgXG4gICAgY29uc3RydWN0b3IoKSB7IHJldHVybiB0aGlzIH1cbn1cbiIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG5mdW5jdGlvbiBFdmVudEVtaXR0ZXIoKSB7XG4gIHRoaXMuX2V2ZW50cyA9IHRoaXMuX2V2ZW50cyB8fCB7fTtcbiAgdGhpcy5fbWF4TGlzdGVuZXJzID0gdGhpcy5fbWF4TGlzdGVuZXJzIHx8IHVuZGVmaW5lZDtcbn1cbm1vZHVsZS5leHBvcnRzID0gRXZlbnRFbWl0dGVyO1xuXG4vLyBCYWNrd2FyZHMtY29tcGF0IHdpdGggbm9kZSAwLjEwLnhcbkV2ZW50RW1pdHRlci5FdmVudEVtaXR0ZXIgPSBFdmVudEVtaXR0ZXI7XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuX2V2ZW50cyA9IHVuZGVmaW5lZDtcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuX21heExpc3RlbmVycyA9IHVuZGVmaW5lZDtcblxuLy8gQnkgZGVmYXVsdCBFdmVudEVtaXR0ZXJzIHdpbGwgcHJpbnQgYSB3YXJuaW5nIGlmIG1vcmUgdGhhbiAxMCBsaXN0ZW5lcnMgYXJlXG4vLyBhZGRlZCB0byBpdC4gVGhpcyBpcyBhIHVzZWZ1bCBkZWZhdWx0IHdoaWNoIGhlbHBzIGZpbmRpbmcgbWVtb3J5IGxlYWtzLlxuRXZlbnRFbWl0dGVyLmRlZmF1bHRNYXhMaXN0ZW5lcnMgPSAxMDtcblxuLy8gT2J2aW91c2x5IG5vdCBhbGwgRW1pdHRlcnMgc2hvdWxkIGJlIGxpbWl0ZWQgdG8gMTAuIFRoaXMgZnVuY3Rpb24gYWxsb3dzXG4vLyB0aGF0IHRvIGJlIGluY3JlYXNlZC4gU2V0IHRvIHplcm8gZm9yIHVubGltaXRlZC5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuc2V0TWF4TGlzdGVuZXJzID0gZnVuY3Rpb24obikge1xuICBpZiAoIWlzTnVtYmVyKG4pIHx8IG4gPCAwIHx8IGlzTmFOKG4pKVxuICAgIHRocm93IFR5cGVFcnJvcignbiBtdXN0IGJlIGEgcG9zaXRpdmUgbnVtYmVyJyk7XG4gIHRoaXMuX21heExpc3RlbmVycyA9IG47XG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIgZXIsIGhhbmRsZXIsIGxlbiwgYXJncywgaSwgbGlzdGVuZXJzO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKVxuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuXG4gIC8vIElmIHRoZXJlIGlzIG5vICdlcnJvcicgZXZlbnQgbGlzdGVuZXIgdGhlbiB0aHJvdy5cbiAgaWYgKHR5cGUgPT09ICdlcnJvcicpIHtcbiAgICBpZiAoIXRoaXMuX2V2ZW50cy5lcnJvciB8fFxuICAgICAgICAoaXNPYmplY3QodGhpcy5fZXZlbnRzLmVycm9yKSAmJiAhdGhpcy5fZXZlbnRzLmVycm9yLmxlbmd0aCkpIHtcbiAgICAgIGVyID0gYXJndW1lbnRzWzFdO1xuICAgICAgaWYgKGVyIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgICAgdGhyb3cgZXI7IC8vIFVuaGFuZGxlZCAnZXJyb3InIGV2ZW50XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBBdCBsZWFzdCBnaXZlIHNvbWUga2luZCBvZiBjb250ZXh0IHRvIHRoZSB1c2VyXG4gICAgICAgIHZhciBlcnIgPSBuZXcgRXJyb3IoJ1VuY2F1Z2h0LCB1bnNwZWNpZmllZCBcImVycm9yXCIgZXZlbnQuICgnICsgZXIgKyAnKScpO1xuICAgICAgICBlcnIuY29udGV4dCA9IGVyO1xuICAgICAgICB0aHJvdyBlcnI7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgaGFuZGxlciA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICBpZiAoaXNVbmRlZmluZWQoaGFuZGxlcikpXG4gICAgcmV0dXJuIGZhbHNlO1xuXG4gIGlmIChpc0Z1bmN0aW9uKGhhbmRsZXIpKSB7XG4gICAgc3dpdGNoIChhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICAvLyBmYXN0IGNhc2VzXG4gICAgICBjYXNlIDE6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDI6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0pO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMzpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSwgYXJndW1lbnRzWzJdKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICAvLyBzbG93ZXJcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICAgICAgICBoYW5kbGVyLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgIH1cbiAgfSBlbHNlIGlmIChpc09iamVjdChoYW5kbGVyKSkge1xuICAgIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICAgIGxpc3RlbmVycyA9IGhhbmRsZXIuc2xpY2UoKTtcbiAgICBsZW4gPSBsaXN0ZW5lcnMubGVuZ3RoO1xuICAgIGZvciAoaSA9IDA7IGkgPCBsZW47IGkrKylcbiAgICAgIGxpc3RlbmVyc1tpXS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIHZhciBtO1xuXG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcblxuICAvLyBUbyBhdm9pZCByZWN1cnNpb24gaW4gdGhlIGNhc2UgdGhhdCB0eXBlID09PSBcIm5ld0xpc3RlbmVyXCIhIEJlZm9yZVxuICAvLyBhZGRpbmcgaXQgdG8gdGhlIGxpc3RlbmVycywgZmlyc3QgZW1pdCBcIm5ld0xpc3RlbmVyXCIuXG4gIGlmICh0aGlzLl9ldmVudHMubmV3TGlzdGVuZXIpXG4gICAgdGhpcy5lbWl0KCduZXdMaXN0ZW5lcicsIHR5cGUsXG4gICAgICAgICAgICAgIGlzRnVuY3Rpb24obGlzdGVuZXIubGlzdGVuZXIpID9cbiAgICAgICAgICAgICAgbGlzdGVuZXIubGlzdGVuZXIgOiBsaXN0ZW5lcik7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgLy8gT3B0aW1pemUgdGhlIGNhc2Ugb2Ygb25lIGxpc3RlbmVyLiBEb24ndCBuZWVkIHRoZSBleHRyYSBhcnJheSBvYmplY3QuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdID0gbGlzdGVuZXI7XG4gIGVsc2UgaWYgKGlzT2JqZWN0KHRoaXMuX2V2ZW50c1t0eXBlXSkpXG4gICAgLy8gSWYgd2UndmUgYWxyZWFkeSBnb3QgYW4gYXJyYXksIGp1c3QgYXBwZW5kLlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXS5wdXNoKGxpc3RlbmVyKTtcbiAgZWxzZVxuICAgIC8vIEFkZGluZyB0aGUgc2Vjb25kIGVsZW1lbnQsIG5lZWQgdG8gY2hhbmdlIHRvIGFycmF5LlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXSA9IFt0aGlzLl9ldmVudHNbdHlwZV0sIGxpc3RlbmVyXTtcblxuICAvLyBDaGVjayBmb3IgbGlzdGVuZXIgbGVha1xuICBpZiAoaXNPYmplY3QodGhpcy5fZXZlbnRzW3R5cGVdKSAmJiAhdGhpcy5fZXZlbnRzW3R5cGVdLndhcm5lZCkge1xuICAgIGlmICghaXNVbmRlZmluZWQodGhpcy5fbWF4TGlzdGVuZXJzKSkge1xuICAgICAgbSA9IHRoaXMuX21heExpc3RlbmVycztcbiAgICB9IGVsc2Uge1xuICAgICAgbSA9IEV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzO1xuICAgIH1cblxuICAgIGlmIChtICYmIG0gPiAwICYmIHRoaXMuX2V2ZW50c1t0eXBlXS5sZW5ndGggPiBtKSB7XG4gICAgICB0aGlzLl9ldmVudHNbdHlwZV0ud2FybmVkID0gdHJ1ZTtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJyhub2RlKSB3YXJuaW5nOiBwb3NzaWJsZSBFdmVudEVtaXR0ZXIgbWVtb3J5ICcgK1xuICAgICAgICAgICAgICAgICAgICAnbGVhayBkZXRlY3RlZC4gJWQgbGlzdGVuZXJzIGFkZGVkLiAnICtcbiAgICAgICAgICAgICAgICAgICAgJ1VzZSBlbWl0dGVyLnNldE1heExpc3RlbmVycygpIHRvIGluY3JlYXNlIGxpbWl0LicsXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2V2ZW50c1t0eXBlXS5sZW5ndGgpO1xuICAgICAgaWYgKHR5cGVvZiBjb25zb2xlLnRyYWNlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIC8vIG5vdCBzdXBwb3J0ZWQgaW4gSUUgMTBcbiAgICAgICAgY29uc29sZS50cmFjZSgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbiA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXI7XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub25jZSA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICB2YXIgZmlyZWQgPSBmYWxzZTtcblxuICBmdW5jdGlvbiBnKCkge1xuICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgZyk7XG5cbiAgICBpZiAoIWZpcmVkKSB7XG4gICAgICBmaXJlZCA9IHRydWU7XG4gICAgICBsaXN0ZW5lci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cbiAgfVxuXG4gIGcubGlzdGVuZXIgPSBsaXN0ZW5lcjtcbiAgdGhpcy5vbih0eXBlLCBnKTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8vIGVtaXRzIGEgJ3JlbW92ZUxpc3RlbmVyJyBldmVudCBpZmYgdGhlIGxpc3RlbmVyIHdhcyByZW1vdmVkXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgdmFyIGxpc3QsIHBvc2l0aW9uLCBsZW5ndGgsIGk7XG5cbiAgaWYgKCFpc0Z1bmN0aW9uKGxpc3RlbmVyKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0dXJuIHRoaXM7XG5cbiAgbGlzdCA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgbGVuZ3RoID0gbGlzdC5sZW5ndGg7XG4gIHBvc2l0aW9uID0gLTE7XG5cbiAgaWYgKGxpc3QgPT09IGxpc3RlbmVyIHx8XG4gICAgICAoaXNGdW5jdGlvbihsaXN0Lmxpc3RlbmVyKSAmJiBsaXN0Lmxpc3RlbmVyID09PSBsaXN0ZW5lcikpIHtcbiAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIGlmICh0aGlzLl9ldmVudHMucmVtb3ZlTGlzdGVuZXIpXG4gICAgICB0aGlzLmVtaXQoJ3JlbW92ZUxpc3RlbmVyJywgdHlwZSwgbGlzdGVuZXIpO1xuXG4gIH0gZWxzZSBpZiAoaXNPYmplY3QobGlzdCkpIHtcbiAgICBmb3IgKGkgPSBsZW5ndGg7IGktLSA+IDA7KSB7XG4gICAgICBpZiAobGlzdFtpXSA9PT0gbGlzdGVuZXIgfHxcbiAgICAgICAgICAobGlzdFtpXS5saXN0ZW5lciAmJiBsaXN0W2ldLmxpc3RlbmVyID09PSBsaXN0ZW5lcikpIHtcbiAgICAgICAgcG9zaXRpb24gPSBpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAocG9zaXRpb24gPCAwKVxuICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICBpZiAobGlzdC5sZW5ndGggPT09IDEpIHtcbiAgICAgIGxpc3QubGVuZ3RoID0gMDtcbiAgICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgfSBlbHNlIHtcbiAgICAgIGxpc3Quc3BsaWNlKHBvc2l0aW9uLCAxKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKVxuICAgICAgdGhpcy5lbWl0KCdyZW1vdmVMaXN0ZW5lcicsIHR5cGUsIGxpc3RlbmVyKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciBrZXksIGxpc3RlbmVycztcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICByZXR1cm4gdGhpcztcblxuICAvLyBub3QgbGlzdGVuaW5nIGZvciByZW1vdmVMaXN0ZW5lciwgbm8gbmVlZCB0byBlbWl0XG4gIGlmICghdGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKSB7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApXG4gICAgICB0aGlzLl9ldmVudHMgPSB7fTtcbiAgICBlbHNlIGlmICh0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gZW1pdCByZW1vdmVMaXN0ZW5lciBmb3IgYWxsIGxpc3RlbmVycyBvbiBhbGwgZXZlbnRzXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgZm9yIChrZXkgaW4gdGhpcy5fZXZlbnRzKSB7XG4gICAgICBpZiAoa2V5ID09PSAncmVtb3ZlTGlzdGVuZXInKSBjb250aW51ZTtcbiAgICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKGtleSk7XG4gICAgfVxuICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKCdyZW1vdmVMaXN0ZW5lcicpO1xuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgbGlzdGVuZXJzID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIGlmIChpc0Z1bmN0aW9uKGxpc3RlbmVycykpIHtcbiAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVycyk7XG4gIH0gZWxzZSBpZiAobGlzdGVuZXJzKSB7XG4gICAgLy8gTElGTyBvcmRlclxuICAgIHdoaWxlIChsaXN0ZW5lcnMubGVuZ3RoKVxuICAgICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcnNbbGlzdGVuZXJzLmxlbmd0aCAtIDFdKTtcbiAgfVxuICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lcnMgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciByZXQ7XG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0ID0gW107XG4gIGVsc2UgaWYgKGlzRnVuY3Rpb24odGhpcy5fZXZlbnRzW3R5cGVdKSlcbiAgICByZXQgPSBbdGhpcy5fZXZlbnRzW3R5cGVdXTtcbiAgZWxzZVxuICAgIHJldCA9IHRoaXMuX2V2ZW50c1t0eXBlXS5zbGljZSgpO1xuICByZXR1cm4gcmV0O1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lckNvdW50ID0gZnVuY3Rpb24odHlwZSkge1xuICBpZiAodGhpcy5fZXZlbnRzKSB7XG4gICAgdmFyIGV2bGlzdGVuZXIgPSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgICBpZiAoaXNGdW5jdGlvbihldmxpc3RlbmVyKSlcbiAgICAgIHJldHVybiAxO1xuICAgIGVsc2UgaWYgKGV2bGlzdGVuZXIpXG4gICAgICByZXR1cm4gZXZsaXN0ZW5lci5sZW5ndGg7XG4gIH1cbiAgcmV0dXJuIDA7XG59O1xuXG5FdmVudEVtaXR0ZXIubGlzdGVuZXJDb3VudCA9IGZ1bmN0aW9uKGVtaXR0ZXIsIHR5cGUpIHtcbiAgcmV0dXJuIGVtaXR0ZXIubGlzdGVuZXJDb3VudCh0eXBlKTtcbn07XG5cbmZ1bmN0aW9uIGlzRnVuY3Rpb24oYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnZnVuY3Rpb24nO1xufVxuXG5mdW5jdGlvbiBpc051bWJlcihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdudW1iZXInO1xufVxuXG5mdW5jdGlvbiBpc09iamVjdChhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdvYmplY3QnICYmIGFyZyAhPT0gbnVsbDtcbn1cblxuZnVuY3Rpb24gaXNVbmRlZmluZWQoYXJnKSB7XG4gIHJldHVybiBhcmcgPT09IHZvaWQgMDtcbn1cbiJdfQ==
