"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _core = require("../../utils/core");

var _throttle = require("lodash/throttle");

var _throttle2 = _interopRequireDefault(_throttle);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Stage = function () {
	function Stage(_options) {
		_classCallCheck(this, Stage);

		this.settings = _options || {};
		this.id = "epubjs-container-" + (0, _core.uuid)();

		this.container = this.create(this.settings);

		if (this.settings.hidden) {
			this.wrapper = this.wrap(this.container);
		}
	}

	/*
 * Creates an element to render to.
 * Resizes to passed width and height or to the elements size
 */


	_createClass(Stage, [{
		key: "create",
		value: function create(options) {
			var height = options.height; // !== false ? options.height : "100%";
			var width = options.width; // !== false ? options.width : "100%";
			var overflow = options.overflow || false;
			var axis = options.axis || "vertical";
			var direction = options.direction;

			if (options.height && (0, _core.isNumber)(options.height)) {
				height = options.height + "px";
			}

			if (options.width && (0, _core.isNumber)(options.width)) {
				width = options.width + "px";
			}

			// Create new container element
			var container = document.createElement("div");

			container.id = this.id;
			container.classList.add("epub-container");

			// Style Element
			// container.style.fontSize = "0";
			container.style.wordSpacing = "0";
			container.style.lineHeight = "0";
			container.style.verticalAlign = "top";
			container.style.position = "relative";

			if (axis === "horizontal") {
				// container.style.whiteSpace = "nowrap";
				container.style.display = "flex";
				container.style.flexDirection = "row";
				container.style.flexWrap = "nowrap";
			}

			if (width) {
				container.style.width = width;
			}

			if (height) {
				container.style.height = height;
			}

			if (overflow) {
				container.style.overflow = overflow;
			}

			if (direction) {
				container.dir = direction;
				container.style["direction"] = direction;
			}

			if (direction && this.settings.fullsize) {
				document.body.style["direction"] = direction;
			}

			return container;
		}
	}, {
		key: "wrap",
		value: function wrap(container) {
			var wrapper = document.createElement("div");

			wrapper.style.visibility = "hidden";
			wrapper.style.overflow = "hidden";
			wrapper.style.width = "0";
			wrapper.style.height = "0";

			wrapper.appendChild(container);
			return wrapper;
		}
	}, {
		key: "getElement",
		value: function getElement(_element) {
			var element;

			if ((0, _core.isElement)(_element)) {
				element = _element;
			} else if (typeof _element === "string") {
				element = document.getElementById(_element);
			}

			if (!element) {
				throw new Error("Not an Element");
			}

			return element;
		}
	}, {
		key: "attachTo",
		value: function attachTo(what) {

			var element = this.getElement(what);
			var base;

			if (!element) {
				return;
			}

			if (this.settings.hidden) {
				base = this.wrapper;
			} else {
				base = this.container;
			}

			element.appendChild(base);

			this.element = element;

			return element;
		}
	}, {
		key: "getContainer",
		value: function getContainer() {
			return this.container;
		}
	}, {
		key: "onResize",
		value: function onResize(func) {
			// Only listen to window for resize event if width and height are not fixed.
			// This applies if it is set to a percent or auto.
			if (!(0, _core.isNumber)(this.settings.width) || !(0, _core.isNumber)(this.settings.height)) {
				this.resizeFunc = (0, _throttle2.default)(func, 50);
				window.addEventListener("resize", this.resizeFunc, false);
			}
		}
	}, {
		key: "onOrientationChange",
		value: function onOrientationChange(func) {
			this.orientationChangeFunc = func;
			window.addEventListener("orientationchange", this.orientationChangeFunc, false);
		}
	}, {
		key: "size",
		value: function size(width, height) {
			var bounds;
			// var width = _width || this.settings.width;
			// var height = _height || this.settings.height;

			// If width or height are set to false, inherit them from containing element
			if (width === null) {
				bounds = this.element.getBoundingClientRect();

				if (bounds.width) {
					width = Math.floor(bounds.width);
					this.container.style.width = width + "px";
				}
			}

			if (height === null) {
				bounds = bounds || this.element.getBoundingClientRect();

				if (bounds.height) {
					height = bounds.height;
					this.container.style.height = bounds.height + "px";
				}
			}

			if (!(0, _core.isNumber)(width)) {
				bounds = this.container.getBoundingClientRect();
				width = Math.floor(bounds.width);
				//height = bounds.height;
			}

			if (!(0, _core.isNumber)(height)) {
				bounds = bounds || this.container.getBoundingClientRect();
				//width = bounds.width;
				height = bounds.height;
			}

			this.containerStyles = window.getComputedStyle(this.container);

			this.containerPadding = {
				left: parseFloat(this.containerStyles["padding-left"]) || 0,
				right: parseFloat(this.containerStyles["padding-right"]) || 0,
				top: parseFloat(this.containerStyles["padding-top"]) || 0,
				bottom: parseFloat(this.containerStyles["padding-bottom"]) || 0
			};

			// Bounds not set, get them from window
			var _windowBounds = (0, _core.windowBounds)();
			if (!width) {
				width = _windowBounds.width;
			}
			if (this.settings.fullsize || !height) {
				height = _windowBounds.height;
			}

			return {
				width: width - this.containerPadding.left - this.containerPadding.right,
				height: height - this.containerPadding.top - this.containerPadding.bottom
			};
		}
	}, {
		key: "bounds",
		value: function bounds() {
			var box = void 0;
			if (this.container.style.overflow !== "visible") {
				box = this.container && this.container.getBoundingClientRect();
			}

			if (!box || !box.width || !box.height) {
				return (0, _core.windowBounds)();
			} else {
				return box;
			}
		}
	}, {
		key: "getSheet",
		value: function getSheet() {
			var style = document.createElement("style");

			// WebKit hack --> https://davidwalsh.name/add-rules-stylesheets
			style.appendChild(document.createTextNode(""));

			document.head.appendChild(style);

			return style.sheet;
		}
	}, {
		key: "addStyleRules",
		value: function addStyleRules(selector, rulesArray) {
			var scope = "#" + this.id + " ";
			var rules = "";

			if (!this.sheet) {
				this.sheet = this.getSheet();
			}

			rulesArray.forEach(function (set) {
				for (var prop in set) {
					if (set.hasOwnProperty(prop)) {
						rules += prop + ":" + set[prop] + ";";
					}
				}
			});

			this.sheet.insertRule(scope + selector + " {" + rules + "}", 0);
		}
	}, {
		key: "axis",
		value: function axis(_axis) {
			if (_axis === "horizontal") {
				this.container.style.display = "flex";
				this.container.style.flexDirection = "row";
				this.container.style.flexWrap = "nowrap";
			} else {
				this.container.style.display = "block";
			}
		}

		// orientation(orientation) {
		// 	if (orientation === "landscape") {
		//
		// 	} else {
		//
		// 	}
		//
		// 	this.orientation = orientation;
		// }

	}, {
		key: "direction",
		value: function direction(dir) {
			if (this.container) {
				this.container.dir = dir;
				this.container.style["direction"] = dir;
			}

			if (this.settings.fullsize) {
				document.body.style["direction"] = dir;
			}
		}
	}, {
		key: "destroy",
		value: function destroy() {
			var base;

			if (this.element) {

				if (this.settings.hidden) {
					base = this.wrapper;
				} else {
					base = this.container;
				}

				if (this.element.contains(this.container)) {
					this.element.removeChild(this.container);
				}

				window.removeEventListener("resize", this.resizeFunc);
				window.removeEventListener("orientationChange", this.orientationChangeFunc);
			}
		}
	}]);

	return Stage;
}();

exports.default = Stage;
module.exports = exports["default"];