"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
// import Mapping from "./mapping";


// Default Views


// Default View Managers


var _eventEmitter = require("event-emitter");

var _eventEmitter2 = _interopRequireDefault(_eventEmitter);

var _core = require("./utils/core");

var _hook = require("./utils/hook");

var _hook2 = _interopRequireDefault(_hook);

var _epubcfi = require("./epubcfi");

var _epubcfi2 = _interopRequireDefault(_epubcfi);

var _queue = require("./utils/queue");

var _queue2 = _interopRequireDefault(_queue);

var _layout = require("./layout");

var _layout2 = _interopRequireDefault(_layout);

var _themes = require("./themes");

var _themes2 = _interopRequireDefault(_themes);

var _contents = require("./contents");

var _contents2 = _interopRequireDefault(_contents);

var _annotations = require("./annotations");

var _annotations2 = _interopRequireDefault(_annotations);

var _constants = require("./utils/constants");

var _iframe = require("./managers/views/iframe");

var _iframe2 = _interopRequireDefault(_iframe);

var _index = require("./managers/default/index");

var _index2 = _interopRequireDefault(_index);

var _index3 = require("./managers/continuous/index");

var _index4 = _interopRequireDefault(_index3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Displays an Epub as a series of Views for each Section.
 * Requires Manager and View class to handle specifics of rendering
 * the section contetn.
 * @class
 * @param {Book} book
 * @param {object} [options]
 * @param {number} [options.width]
 * @param {number} [options.height]
 * @param {string} [options.ignoreClass] class for the cfi parser to ignore
 * @param {string | function | object} [options.manager='default']
 * @param {string | function} [options.view='iframe']
 * @param {string} [options.layout] layout to force
 * @param {string} [options.spread] force spread value
 * @param {number} [options.minSpreadWidth] overridden by spread: none (never) / both (always)
 * @param {string} [options.stylesheet] url of stylesheet to be injected
 * @param {string} [options.script] url of script to be injected
 */
var Rendition = function () {
	function Rendition(book, options) {
		_classCallCheck(this, Rendition);

		this.settings = (0, _core.extend)(this.settings || {}, {
			width: null,
			height: null,
			ignoreClass: "",
			manager: "default",
			view: "iframe",
			flow: null,
			layout: null,
			spread: null,
			minSpreadWidth: 800,
			stylesheet: null,
			script: null
		});

		(0, _core.extend)(this.settings, options);

		if (_typeof(this.settings.manager) === "object") {
			this.manager = this.settings.manager;
		}

		this.book = book;

		/**
   * Adds Hook methods to the Rendition prototype
   * @member {object} hooks
   * @property {Hook} hooks.content
   * @memberof Rendition
   */
		this.hooks = {};
		this.hooks.display = new _hook2.default(this);
		this.hooks.serialize = new _hook2.default(this);
		this.hooks.content = new _hook2.default(this);
		this.hooks.unloaded = new _hook2.default(this);
		this.hooks.layout = new _hook2.default(this);
		this.hooks.render = new _hook2.default(this);
		this.hooks.show = new _hook2.default(this);

		this.hooks.content.register(this.handleLinks.bind(this));
		this.hooks.content.register(this.passEvents.bind(this));
		this.hooks.content.register(this.adjustImages.bind(this));

		this.book.spine.hooks.content.register(this.injectIdentifier.bind(this));

		if (this.settings.stylesheet) {
			this.book.spine.hooks.content.register(this.injectStylesheet.bind(this));
		}

		if (this.settings.script) {
			this.book.spine.hooks.content.register(this.injectScript.bind(this));
		}

		/**
   * @member {Themes} themes
   * @memberof Rendition
   */
		this.themes = new _themes2.default(this);

		/**
   * @member {Annotations} annotations
   * @memberof Rendition
   */
		this.annotations = new _annotations2.default(this);

		this.epubcfi = new _epubcfi2.default();

		this.q = new _queue2.default(this);

		/**
   * A Rendered Location Range
   * @typedef location
   * @type {Object}
   * @property {object} start
   * @property {string} start.index
   * @property {string} start.href
   * @property {object} start.displayed
   * @property {EpubCFI} start.cfi
   * @property {number} start.location
   * @property {number} start.percentage
   * @property {number} start.displayed.page
   * @property {number} start.displayed.total
   * @property {object} end
   * @property {string} end.index
   * @property {string} end.href
   * @property {object} end.displayed
   * @property {EpubCFI} end.cfi
   * @property {number} end.location
   * @property {number} end.percentage
   * @property {number} end.displayed.page
   * @property {number} end.displayed.total
   * @property {boolean} atStart
   * @property {boolean} atEnd
   * @memberof Rendition
   */
		this.location = undefined;

		// Hold queue until book is opened
		this.q.enqueue(this.book.opened);

		this.starting = new _core.defer();
		/**
   * @member {promise} started returns after the rendition has started
   * @memberof Rendition
   */
		this.started = this.starting.promise;
		// Block the queue until rendering is started
		this.q.enqueue(this.start);
	}

	/**
  * Set the manager function
  * @param {function} manager
  */


	_createClass(Rendition, [{
		key: "setManager",
		value: function setManager(manager) {
			this.manager = manager;
		}

		/**
   * Require the manager from passed string, or as a class function
   * @param  {string|object} manager [description]
   * @return {method}
   */

	}, {
		key: "requireManager",
		value: function requireManager(manager) {
			var viewManager;

			// If manager is a string, try to load from imported managers
			if (typeof manager === "string" && manager === "default") {
				viewManager = _index2.default;
			} else if (typeof manager === "string" && manager === "continuous") {
				viewManager = _index4.default;
			} else {
				// otherwise, assume we were passed a class function
				viewManager = manager;
			}

			return viewManager;
		}

		/**
   * Require the view from passed string, or as a class function
   * @param  {string|object} view
   * @return {view}
   */

	}, {
		key: "requireView",
		value: function requireView(view) {
			var View;

			// If view is a string, try to load from imported views,
			if (typeof view == "string" && view === "iframe") {
				View = _iframe2.default;
			} else {
				// otherwise, assume we were passed a class function
				View = view;
			}

			return View;
		}

		/**
   * Start the rendering
   * @return {Promise} rendering has started
   */

	}, {
		key: "start",
		value: function start() {

			if (!this.manager) {
				this.ViewManager = this.requireManager(this.settings.manager);
				this.View = this.requireView(this.settings.view);

				this.manager = new this.ViewManager({
					view: this.View,
					queue: this.q,
					request: this.book.load.bind(this.book),
					settings: this.settings
				});
			}

			this.direction(this.book.package.metadata.direction);

			// Parse metadata to get layout props
			this.settings.globalLayoutProperties = this.determineLayoutProperties(this.book.package.metadata);

			this.flow(this.settings.globalLayoutProperties.flow);

			this.layout(this.settings.globalLayoutProperties);

			// Listen for displayed views
			this.manager.on(_constants.EVENTS.MANAGERS.ADDED, this.afterDisplayed.bind(this));
			this.manager.on(_constants.EVENTS.MANAGERS.REMOVED, this.afterRemoved.bind(this));

			// Listen for resizing
			this.manager.on(_constants.EVENTS.MANAGERS.RESIZED, this.onResized.bind(this));

			// Listen for rotation
			this.manager.on(_constants.EVENTS.MANAGERS.ORIENTATION_CHANGE, this.onOrientationChange.bind(this));

			// Listen for scroll changes
			this.manager.on(_constants.EVENTS.MANAGERS.SCROLLED, this.reportLocation.bind(this));

			/**
    * Emit that rendering has started
    * @event started
    * @memberof Rendition
    */
			this.emit(_constants.EVENTS.RENDITION.STARTED);

			// Start processing queue
			this.starting.resolve();
		}

		/**
   * Call to attach the container to an element in the dom
   * Container must be attached before rendering can begin
   * @param  {element} element to attach to
   * @return {Promise}
   */

	}, {
		key: "attachTo",
		value: function attachTo(element) {

			return this.q.enqueue(function () {

				// Start rendering
				this.manager.render(element, {
					"width": this.settings.width,
					"height": this.settings.height
				});

				/**
     * Emit that rendering has attached to an element
     * @event attached
     * @memberof Rendition
     */
				this.emit(_constants.EVENTS.RENDITION.ATTACHED);
			}.bind(this));
		}

		/**
   * Display a point in the book
   * The request will be added to the rendering Queue,
   * so it will wait until book is opened, rendering started
   * and all other rendering tasks have finished to be called.
   * @param  {string} target Url or EpubCFI
   * @return {Promise}
   */

	}, {
		key: "display",
		value: function display(target) {
			if (this.displaying) {
				this.displaying.resolve();
			}
			return this.q.enqueue(this._display, target);
		}

		/**
   * Tells the manager what to display immediately
   * @private
   * @param  {string} target Url or EpubCFI
   * @return {Promise}
   */

	}, {
		key: "_display",
		value: function _display(target) {
			var _this = this;

			if (!this.book) {
				return;
			}
			var isCfiString = this.epubcfi.isCfiString(target);
			var displaying = new _core.defer();
			var displayed = displaying.promise;
			var section;
			var moveTo;

			this.displaying = displaying;

			// Check if this is a book percentage
			if (this.book.locations.length() && (0, _core.isFloat)(target)) {
				target = this.book.locations.cfiFromPercentage(parseFloat(target));
			}

			section = this.book.spine.get(target);

			if (!section) {
				displaying.reject(new Error("No Section Found"));
				return displayed;
			}

			this.manager.display(section, target).then(function () {
				displaying.resolve(section);
				_this.displaying = undefined;

				/**
     * Emit that a section has been displayed
     * @event displayed
     * @param {Section} section
     * @memberof Rendition
     */
				_this.emit(_constants.EVENTS.RENDITION.DISPLAYED, section);
				_this.reportLocation();
			}, function (err) {
				/**
     * Emit that has been an error displaying
     * @event displayError
     * @param {Section} section
     * @memberof Rendition
     */
				_this.emit(_constants.EVENTS.RENDITION.DISPLAY_ERROR, err);
			});

			return displayed;
		}

		/*
  render(view, show) {
  		// view.onLayout = this.layout.format.bind(this.layout);
  	view.create();
  		// Fit to size of the container, apply padding
  	this.manager.resizeView(view);
  		// Render Chain
  	return view.section.render(this.book.request)
  		.then(function(contents){
  			return view.load(contents);
  		}.bind(this))
  		.then(function(doc){
  			return this.hooks.content.trigger(view, this);
  		}.bind(this))
  		.then(function(){
  			this.layout.format(view.contents);
  			return this.hooks.layout.trigger(view, this);
  		}.bind(this))
  		.then(function(){
  			return view.display();
  		}.bind(this))
  		.then(function(){
  			return this.hooks.render.trigger(view, this);
  		}.bind(this))
  		.then(function(){
  			if(show !== false) {
  				this.q.enqueue(function(view){
  					view.show();
  				}, view);
  			}
  			// this.map = new Map(view, this.layout);
  			this.hooks.show.trigger(view, this);
  			this.trigger("rendered", view.section);
  			}.bind(this))
  		.catch(function(e){
  			this.trigger("loaderror", e);
  		}.bind(this));
  	}
  */

		/**
   * Report what section has been displayed
   * @private
   * @param  {*} view
   */

	}, {
		key: "afterDisplayed",
		value: function afterDisplayed(view) {
			var _this2 = this;

			view.on(_constants.EVENTS.VIEWS.MARK_CLICKED, function (cfiRange, data) {
				return _this2.triggerMarkEvent(cfiRange, data, view);
			});

			this.hooks.render.trigger(view, this).then(function () {
				if (view.contents) {
					_this2.hooks.content.trigger(view.contents, _this2).then(function () {
						/**
       * Emit that a section has been rendered
       * @event rendered
       * @param {Section} section
       * @param {View} view
       * @memberof Rendition
       */
						_this2.emit(_constants.EVENTS.RENDITION.RENDERED, view.section, view);
					});
				} else {
					_this2.emit(_constants.EVENTS.RENDITION.RENDERED, view.section, view);
				}
			});
		}

		/**
   * Report what has been removed
   * @private
   * @param  {*} view
   */

	}, {
		key: "afterRemoved",
		value: function afterRemoved(view) {
			var _this3 = this;

			this.hooks.unloaded.trigger(view, this).then(function () {
				/**
     * Emit that a section has been removed
     * @event removed
     * @param {Section} section
     * @param {View} view
     * @memberof Rendition
     */
				_this3.emit(_constants.EVENTS.RENDITION.REMOVED, view.section, view);
			});
		}

		/**
   * Report resize events and display the last seen location
   * @private
   */

	}, {
		key: "onResized",
		value: function onResized(size) {

			/**
    * Emit that the rendition has been resized
    * @event resized
    * @param {number} width
    * @param {height} height
    * @memberof Rendition
    */
			this.emit(_constants.EVENTS.RENDITION.RESIZED, {
				width: size.width,
				height: size.height
			});

			if (this.location && this.location.start) {
				this.display(this.location.start.cfi);
			}
		}

		/**
   * Report orientation events and display the last seen location
   * @private
   */

	}, {
		key: "onOrientationChange",
		value: function onOrientationChange(orientation) {
			/**
    * Emit that the rendition has been rotated
    * @event orientationchange
    * @param {string} orientation
    * @memberof Rendition
    */
			this.emit(_constants.EVENTS.RENDITION.ORIENTATION_CHANGE, orientation);
		}

		/**
   * Move the Rendition to a specific offset
   * Usually you would be better off calling display()
   * @param {object} offset
   */

	}, {
		key: "moveTo",
		value: function moveTo(offset) {
			this.manager.moveTo(offset);
		}

		/**
   * Trigger a resize of the views
   * @param {number} [width]
   * @param {number} [height]
   */

	}, {
		key: "resize",
		value: function resize(width, height) {
			if (width) {
				this.settings.width = width;
			}
			if (height) {
				this.settings.height = height;
			}
			this.manager.resize(width, height);
		}

		/**
   * Clear all rendered views
   */

	}, {
		key: "clear",
		value: function clear() {
			this.manager.clear();
		}

		/**
   * Go to the next "page" in the rendition
   * @return {Promise}
   */

	}, {
		key: "next",
		value: function next() {
			return this.q.enqueue(this.manager.next.bind(this.manager)).then(this.reportLocation.bind(this));
		}

		/**
   * Go to the previous "page" in the rendition
   * @return {Promise}
   */

	}, {
		key: "prev",
		value: function prev() {
			return this.q.enqueue(this.manager.prev.bind(this.manager)).then(this.reportLocation.bind(this));
		}

		//-- http://www.idpf.org/epub/301/spec/epub-publications.html#meta-properties-rendering
		/**
   * Determine the Layout properties from metadata and settings
   * @private
   * @param  {object} metadata
   * @return {object} properties
   */

	}, {
		key: "determineLayoutProperties",
		value: function determineLayoutProperties(metadata) {
			var properties;
			var layout = this.settings.layout || metadata.layout || "reflowable";
			var spread = this.settings.spread || metadata.spread || "auto";
			var orientation = this.settings.orientation || metadata.orientation || "auto";
			var flow = this.settings.flow || metadata.flow || "auto";
			var viewport = metadata.viewport || "";
			var minSpreadWidth = this.settings.minSpreadWidth || metadata.minSpreadWidth || 800;
			var direction = this.settings.direction || metadata.direction || "ltr";

			if ((this.settings.width === 0 || this.settings.width > 0) && (this.settings.height === 0 || this.settings.height > 0)) {
				// viewport = "width="+this.settings.width+", height="+this.settings.height+"";
			}

			properties = {
				layout: layout,
				spread: spread,
				orientation: orientation,
				flow: flow,
				viewport: viewport,
				minSpreadWidth: minSpreadWidth,
				direction: direction
			};

			return properties;
		}

		/**
   * Adjust the flow of the rendition to paginated or scrolled
   * (scrolled-continuous vs scrolled-doc are handled by different view managers)
   * @param  {string} flow
   */

	}, {
		key: "flow",
		value: function flow(_flow2) {
			var _flow = _flow2;
			if (_flow2 === "scrolled" || _flow2 === "scrolled-doc" || _flow2 === "scrolled-continuous") {
				_flow = "scrolled";
			}

			if (_flow2 === "auto" || _flow2 === "paginated") {
				_flow = "paginated";
			}

			this.settings.flow = _flow2;

			if (this._layout) {
				this._layout.flow(_flow);
			}

			if (this.manager && this._layout) {
				this.manager.applyLayout(this._layout);
			}

			if (this.manager) {
				this.manager.updateFlow(_flow);
			}

			if (this.manager && this.manager.isRendered() && this.location) {
				this.manager.clear();
				this.display(this.location.start.cfi);
			}
		}

		/**
   * Adjust the layout of the rendition to reflowable or pre-paginated
   * @param  {object} settings
   */

	}, {
		key: "layout",
		value: function layout(settings) {
			var _this4 = this;

			if (settings) {
				this._layout = new _layout2.default(settings);
				this._layout.spread(settings.spread, this.settings.minSpreadWidth);

				// this.mapping = new Mapping(this._layout.props);

				this._layout.on(_constants.EVENTS.LAYOUT.UPDATED, function (props, changed) {
					_this4.emit(_constants.EVENTS.RENDITION.LAYOUT, props, changed);
				});
			}

			if (this.manager && this._layout) {
				this.manager.applyLayout(this._layout);
			}

			return this._layout;
		}

		/**
   * Adjust if the rendition uses spreads
   * @param  {string} spread none | auto (TODO: implement landscape, portrait, both)
   * @param  {int} min min width to use spreads at
   */

	}, {
		key: "spread",
		value: function spread(_spread, min) {

			this._layout.spread(_spread, min);

			if (this.manager.isRendered()) {
				this.manager.updateLayout();
			}
		}

		/**
   * Adjust the direction of the rendition
   * @param  {string} dir
   */

	}, {
		key: "direction",
		value: function direction(dir) {

			this.settings.direction = dir || "ltr";

			if (this.manager) {
				this.manager.direction(this.settings.direction);
			}

			if (this.manager && this.manager.isRendered() && this.location) {
				this.manager.clear();
				this.display(this.location.start.cfi);
			}
		}

		/**
   * Report the current location
   * @fires relocated
   * @fires locationChanged
   */

	}, {
		key: "reportLocation",
		value: function reportLocation() {
			return this.q.enqueue(function reportedLocation() {
				requestAnimationFrame(function reportedLocationAfterRAF() {
					var location = this.manager.currentLocation();
					if (location && location.then && typeof location.then === "function") {
						location.then(function (result) {
							var located = this.located(result);

							if (!located || !located.start || !located.end) {
								return;
							}

							this.location = located;

							this.emit(_constants.EVENTS.RENDITION.LOCATION_CHANGED, {
								index: this.location.start.index,
								href: this.location.start.href,
								start: this.location.start.cfi,
								end: this.location.end.cfi,
								percentage: this.location.start.percentage
							});

							this.emit(_constants.EVENTS.RENDITION.RELOCATED, this.location);
						}.bind(this));
					} else if (location) {
						var located = this.located(location);

						if (!located || !located.start || !located.end) {
							return;
						}

						this.location = located;

						/**
       * @event locationChanged
       * @deprecated
       * @type {object}
       * @property {number} index
       * @property {string} href
       * @property {EpubCFI} start
       * @property {EpubCFI} end
       * @property {number} percentage
       * @memberof Rendition
       */
						this.emit(_constants.EVENTS.RENDITION.LOCATION_CHANGED, {
							index: this.location.start.index,
							href: this.location.start.href,
							start: this.location.start.cfi,
							end: this.location.end.cfi,
							percentage: this.location.start.percentage
						});

						/**
       * @event relocated
       * @type {displayedLocation}
       * @memberof Rendition
       */
						this.emit(_constants.EVENTS.RENDITION.RELOCATED, this.location);
					}
				}.bind(this));
			}.bind(this));
		}

		/**
   * Get the Current Location object
   * @return {displayedLocation | promise} location (may be a promise)
   */

	}, {
		key: "currentLocation",
		value: function currentLocation() {
			var location = this.manager.currentLocation();
			if (location && location.then && typeof location.then === "function") {
				location.then(function (result) {
					var located = this.located(result);
					return located;
				}.bind(this));
			} else if (location) {
				var located = this.located(location);
				return located;
			}
		}

		/**
   * Creates a Rendition#locationRange from location
   * passed by the Manager
   * @returns {displayedLocation}
   * @private
   */

	}, {
		key: "located",
		value: function located(location) {
			if (!location.length) {
				return {};
			}
			var start = location[0];
			var end = location[location.length - 1];

			var located = {
				start: {
					index: start.index,
					href: start.href,
					cfi: start.mapping.start,
					displayed: {
						page: start.pages[0] || 1,
						total: start.totalPages
					}
				},
				end: {
					index: end.index,
					href: end.href,
					cfi: end.mapping.end,
					displayed: {
						page: end.pages[end.pages.length - 1] || 1,
						total: end.totalPages
					}
				}
			};

			var locationStart = this.book.locations.locationFromCfi(start.mapping.start);
			var locationEnd = this.book.locations.locationFromCfi(end.mapping.end);

			if (locationStart != null) {
				located.start.location = locationStart;
				located.start.percentage = this.book.locations.percentageFromLocation(locationStart);
			}
			if (locationEnd != null) {
				located.end.location = locationEnd;
				located.end.percentage = this.book.locations.percentageFromLocation(locationEnd);
			}

			var pageStart = this.book.pageList.pageFromCfi(start.mapping.start);
			var pageEnd = this.book.pageList.pageFromCfi(end.mapping.end);

			if (pageStart != -1) {
				located.start.page = pageStart;
			}
			if (pageEnd != -1) {
				located.end.page = pageEnd;
			}

			if (end.index === this.book.spine.last().index && located.end.displayed.page >= located.end.displayed.total) {
				located.atEnd = true;
			}

			if (start.index === this.book.spine.first().index && located.start.displayed.page === 1) {
				located.atStart = true;
			}

			return located;
		}

		/**
   * Remove and Clean Up the Rendition
   */

	}, {
		key: "destroy",
		value: function destroy() {
			// Clear the queue
			// this.q.clear();
			// this.q = undefined;

			this.manager && this.manager.destroy();

			this.book = undefined;

			// this.views = null;

			// this.hooks.display.clear();
			// this.hooks.serialize.clear();
			// this.hooks.content.clear();
			// this.hooks.layout.clear();
			// this.hooks.render.clear();
			// this.hooks.show.clear();
			// this.hooks = {};

			// this.themes.destroy();
			// this.themes = undefined;

			// this.epubcfi = undefined;

			// this.starting = undefined;
			// this.started = undefined;

		}

		/**
   * Pass the events from a view's Contents
   * @private
   * @param  {View} view
   */

	}, {
		key: "passEvents",
		value: function passEvents(contents) {
			var _this5 = this;

			var listenedEvents = _contents2.default.listenedEvents;

			listenedEvents.forEach(function (e) {
				contents.on(e, function (ev) {
					return _this5.triggerViewEvent(ev, contents);
				});
			});

			contents.on(_constants.EVENTS.CONTENTS.SELECTED, function (e) {
				return _this5.triggerSelectedEvent(e, contents);
			});
		}

		/**
   * Emit events passed by a view
   * @private
   * @param  {event} e
   */

	}, {
		key: "triggerViewEvent",
		value: function triggerViewEvent(e, contents) {
			this.emit(e.type, e, contents);
		}

		/**
   * Emit a selection event's CFI Range passed from a a view
   * @private
   * @param  {EpubCFI} cfirange
   */

	}, {
		key: "triggerSelectedEvent",
		value: function triggerSelectedEvent(cfirange, contents) {
			/**
    * Emit that a text selection has occured
    * @event selected
    * @param {EpubCFI} cfirange
    * @param {Contents} contents
    * @memberof Rendition
    */
			this.emit(_constants.EVENTS.RENDITION.SELECTED, cfirange, contents);
		}

		/**
   * Emit a markClicked event with the cfiRange and data from a mark
   * @private
   * @param  {EpubCFI} cfirange
   */

	}, {
		key: "triggerMarkEvent",
		value: function triggerMarkEvent(cfiRange, data, contents) {
			/**
    * Emit that a mark was clicked
    * @event markClicked
    * @param {EpubCFI} cfirange
    * @param {object} data
    * @param {Contents} contents
    * @memberof Rendition
    */
			this.emit(_constants.EVENTS.RENDITION.MARK_CLICKED, cfiRange, data, contents);
		}

		/**
   * Get a Range from a Visible CFI
   * @param  {string} cfi EpubCfi String
   * @param  {string} ignoreClass
   * @return {range}
   */

	}, {
		key: "getRange",
		value: function getRange(cfi, ignoreClass) {
			var _cfi = new _epubcfi2.default(cfi);
			var found = this.manager.visible().filter(function (view) {
				if (_cfi.spinePos === view.index) return true;
			});

			// Should only every return 1 item
			if (found.length) {
				return found[0].contents.range(_cfi, ignoreClass);
			}
		}

		/**
   * Hook to adjust images to fit in columns
   * @param  {Contents} contents
   * @private
   */

	}, {
		key: "adjustImages",
		value: function adjustImages(contents) {

			if (this._layout.name === "pre-paginated") {
				return new Promise(function (resolve) {
					resolve();
				});
			}

			var computed = contents.window.getComputedStyle(contents.content, null);
			var height = contents.content.offsetHeight - (parseFloat(computed.paddingTop) + parseFloat(computed.paddingBottom));

			contents.addStylesheetRules({
				"img": {
					"max-width": (this._layout.columnWidth ? this._layout.columnWidth + "px" : "100%") + "!important",
					"max-height": height + "px" + "!important",
					"object-fit": "contain",
					"page-break-inside": "avoid",
					"break-inside": "avoid"
				},
				"svg": {
					"max-width": (this._layout.columnWidth ? this._layout.columnWidth + "px" : "100%") + "!important",
					"max-height": height + "px" + "!important",
					"page-break-inside": "avoid",
					"break-inside": "avoid"
				}
			});

			return new Promise(function (resolve, reject) {
				// Wait to apply
				setTimeout(function () {
					resolve();
				}, 1);
			});
		}

		/**
   * Get the Contents object of each rendered view
   * @returns {Contents[]}
   */

	}, {
		key: "getContents",
		value: function getContents() {
			return this.manager ? this.manager.getContents() : [];
		}

		/**
   * Get the views member from the manager
   * @returns {Views}
   */

	}, {
		key: "views",
		value: function views() {
			var views = this.manager ? this.manager.views : undefined;
			return views || [];
		}

		/**
   * Hook to handle link clicks in rendered content
   * @param  {Contents} contents
   * @private
   */

	}, {
		key: "handleLinks",
		value: function handleLinks(contents) {
			var _this6 = this;

			if (contents) {
				contents.on(_constants.EVENTS.CONTENTS.LINK_CLICKED, function (href) {
					var relative = _this6.book.path.relative(href);
					_this6.display(relative);
				});
			}
		}

		/**
   * Hook to handle injecting stylesheet before
   * a Section is serialized
   * @param  {document} doc
   * @param  {Section} section
   * @private
   */

	}, {
		key: "injectStylesheet",
		value: function injectStylesheet(doc, section) {
			var style = doc.createElement("link");
			style.setAttribute("type", "text/css");
			style.setAttribute("rel", "stylesheet");
			style.setAttribute("href", this.settings.stylesheet);
			doc.getElementsByTagName("head")[0].appendChild(style);
		}

		/**
   * Hook to handle injecting scripts before
   * a Section is serialized
   * @param  {document} doc
   * @param  {Section} section
   * @private
   */

	}, {
		key: "injectScript",
		value: function injectScript(doc, section) {
			var script = doc.createElement("script");
			script.setAttribute("type", "text/javascript");
			script.setAttribute("src", this.settings.script);
			script.textContent = " "; // Needed to prevent self closing tag
			doc.getElementsByTagName("head")[0].appendChild(script);
		}

		/**
   * Hook to handle the document identifier before
   * a Section is serialized
   * @param  {document} doc
   * @param  {Section} section
   * @private
   */

	}, {
		key: "injectIdentifier",
		value: function injectIdentifier(doc, section) {
			var ident = this.book.package.metadata.identifier;
			var meta = doc.createElement("meta");
			meta.setAttribute("name", "dc.relation.ispartof");
			if (ident) {
				meta.setAttribute("content", ident);
			}
			doc.getElementsByTagName("head")[0].appendChild(meta);
		}
	}]);

	return Rendition;
}();

//-- Enable binding events to Renderer


(0, _eventEmitter2.default)(Rendition.prototype);

exports.default = Rendition;
module.exports = exports["default"];