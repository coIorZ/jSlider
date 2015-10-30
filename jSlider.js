(function (factory) {
	if (typeof define === 'function' && define.amd) {
		define(['jquery'], function ($) {
			return factory($, window, document);
		});
	} else if (typeof module !== 'undefined' && typeof exports === 'object') {
		module.exports = factory(require('jquery'), window, document);
	} else {
		factory($, window, document);
	}
})(function ($, window, document) {
	var defaults,
		hasOwn = Object.prototype.hasOwnProperty;

	defaults = {
		/**  
		 * VARIABLE
		 */
		
		// a classname for bar element
		barClassname: 'j-slider-bar',
		
		// a classname for handler element
		handlerClassname: 'j-slider-handler',
		
		// a classname for tip element
		tipClassname: 'j-slider-tip',
		
		// min value of slider
		minValue: 0,
		
		// max value of slider
		maxValue: 100,
		
		// current value of slider
		value: 0,
		
		// width for bar element
		width: '100%',
		
		// height for bar element
		height: 10,
		
		// border-color for bar element
		barBorderColor: '#000',
		
		// border-style for bar element
		barBorderStyle: 'solid',
		
		// border-width for bar element
		barBorderWidth: 1,
		
		// color for handler element
		handlerColor: '#ddd',
		
		// border-color for handler element
		handlerBorderColor: '#000',
		
		// border-style for handler element
		handlerBorderStyle: 'solid',
		
		// border-width for handler element
		handlerBorderWidth: 1,
		
		// size scale of handler to bar
		handlerScale: 1.3,
		
		// tick color
		tickColor: '#000',
		
		// if show value
		isTip: false,
		
		// if show ticks
		isTick: false,
		
		// value interval of ticks
		tick: 1,
		
		// type
		type: 'continuous',		
		
		// tofixed level
		fixed: 2,
		
		// if maxValue on the left and minValue on the right
		reverse: false,
		
		// reference to window
		windowContext: window,
		
		// reference to document
		// document is required for it is the element that mouse events bind to 
		documentContext: document,
		
		/**  
		 * METHOD
		 */
		
		// invoke before slider is loaded
		// if return false slider will not be loaded
		beforeLoad: function () {
			return true;
		},
		
		// invoke when slider is loaded
		onLoad: $.noop,
		
		// invoke before handler slides
		// if return false slider can not be slided
		beforeSlide: function () {
			return true;
		}, 
		
		// invoke when handler is sliding
		onSlide: $.noop,
		
		// invoke after handler slides
		afterSlide: $.noop,
		
		// invoke before auto slide
		beforeAutoSlide: function () {
			return true;
		},
		
		// invoke during auto slide
		onAutoSlide: $.noop,
		
		// invoke after auto slide
		afterAutoSlide: $.noop
	};

	function JSlider(el, options) {
		this.el = el;
		this.options = options;
		this.$el = $(el);
		this.fixed = options.fixed;
		this.value = options.value;
		this.minValue = options.minValue;
		this.maxValue = options.maxValue;
		this.$window = $(options.windowContext);
		this.$document = $(options.documentContext);
		this.isDrag = false;

		if (!options.beforeLoad(this.value.toFixed(this.fixed), this.minValue, this.maxValue)) return null;

		this.createEls().setHandler().bindEvents();

		options.onLoad(this.value.toFixed(this.fixed), this.minValue, this.maxValue);
	}

	$.extend(JSlider.prototype, {
		createEls: function () {
			this.$bar = $('<div class="' + this.options.barClassname + '"></div>');
			this.$handler = $('<div class="' + this.options.handlerClassname + '"><span class="' + this.options.tipClassname + '"></span></div>');
			this.$ticks = $('<div></div>');
			this.$tip = this.$handler.children('span');
			
			this.$bar.append(this.$ticks);
			this.$bar.append(this.$handler);
			this.$el.append(this.$bar);
			return this;
		},
		
		createTicks: function() {
			var value = this.minValue;
			this.$ticks.empty();
			while(value <= this.maxValue) {
				var $span = $('<span></span>');
				$span.css({
					'position': 'absolute',
					'bottom': 0,
					'left': this.valueToLeft(value) + this.$handler[0].offsetWidth / 2,
					'width': 1,
					'height': this.options.height / 2,
					'background-color': this.options.tickColor,
				});
				this.$ticks.append($span);
				value += this.options.tick;
			}
			return this;
		},

		// reset style of slider and ticks
		reset: function () {
			this.$bar.css({
				'position': 'relative',
				'width': this.options.width,
				'height': this.options.height,
				'border-radius': this.options.height / 2,
				'border-width': this.options.barBorderWidth,
				'border-color': this.options.barBorderColor,
				'border-style': this.options.barBorderStyle
			});
			this.$handler.css({
				'position': 'absolute',
				'width': this.options.height * this.options.handlerScale,
				'height': this.options.height * this.options.handlerScale,
				'line-height': this.options.height * this.options.handlerScale + 'px',
				'left': 0,
				'top': 0,
				'bottom': 0,
				'margin-top': 'auto',
				'margin-bottom': 'auto',
				'border-radius': this.options.height * this.options.handlerScale / 2,
				'border-width': this.options.handlerBorderWidth,
				'border-color': this.options.handlerBorderColor,
				'border-style': this.options.handlerBorderStyle,
				'background-color': this.options.handlerColor
			});
			this.$tip.css({
				'position': 'absolute',
				'font-size': this.options.height,
				'top': -this.$handler[0].offsetHeight,
				'display': this.options.isTip ? 'initial' : 'none'
			});
			this.$ticks.css({
				'position': 'absolute',
				'left': 0,
				'bottom': 0,
				'width': '100%',
				'height': '100%'
			})
			
			// in 'discrete' type, show ticks automatically
			if(this.options.type === 'discrete') this.options.isTick = true;
			
			if(this.options.isTick) this.createTicks();
			this.update();
			return this;
		},
		
		// update handler's position and tip's value and style
		// according to the current value of slider
		update: function () {
			this.setHandler().setTip();

			var wTip = this.$tip[0].offsetWidth,
				wHandler = this.$handler[0].offsetWidth,
				left = (wTip > wHandler ? -1 : 1) * Math.abs(wTip - wHandler) / 2;
			this.$tip.css('left', left);

			return this;
		},

		bindEvents: function () {
			var self = this,
				barLeft = 0,
				offset = 0,
				left = 0,
				len = 0,
				target = this.$bar[0],
				cb1 = this.options.beforeSlide,
				cb2 = this.options.onSlide,
				cb3 = this.options.afterSlide;
					
			// get pageX of bar element
			while (target.offsetParent) {
				barLeft += target.offsetLeft + +target.style.borderLeftWidth.replace(/px$/, '');
				target = target.offsetParent;
			}
 
			this.$handler.on('mousedown', function (e) {
				if (!cb1(self.value.toFixed(self.fixed), self.minValue, self.maxValue)) return;
				self.isDrag = true;
				offset = e.offsetX;
				len = self.$bar.width() - self.$handler[0].offsetWidth;
				
				// if is auto sliding, stop it
				if(self.timer) self.clearTimer();
				
				// prevent cursor style from changing
				e.preventDefault();
			});
			this.$document
				.on('mousemove', function (e) {
					if (!self.isDrag) return;
					
					// current handler.style.left
					left = e.pageX - offset - barLeft;
					
					if(self.options.type === 'discrete') {
						if(left < 0 || left > len) return;
						if(self.leftToValue(left) > self.value + self.options.tick * 0.6) {
							self.value += self.options.tick;
							self.update();
							cb2(self.value.toFixed(self.fixed), self.minValue, self.maxValue);
						}
						if(self.leftToValue(left) < self.value - self.options.tick * 0.6) {
							self.value -= self.options.tick;
							self.update();
							cb2(self.value.toFixed(self.fixed), self.minValue, self.maxValue);
						}
					} else if (self.options.type === 'continuous') {
						self.value = self.leftToValue(left);
						self.update();
						cb2(self.value.toFixed(self.fixed), self.minValue, self.maxValue);
					}
				})
				.on('mouseup', function (e) {
					if (self.isDrag) cb3(self.value.toFixed(self.fixed), self.minValue, self.maxValue);
					self.isDrag = false;
				});

			return this;
		},
		
		// stop auto sliding
		clearTimer: function() {
			clearInterval(this.timer);
			this.timer = null;	
		},
		
		// slide to specific value
		slideValue: function (value, isFire) {
			if (value < this.minValue) value = this.minValue;
			if (value > this.maxValue) value = this.maxValue;
			this.value = value;
			this.update();

			this.options.afterSlide(this.value.toFixed(this.fixed), this.minValue, this.maxValue);

			return this;
		},

		// autoslide by specific increment and interval
		autoSlide: function (increment, interval, isFire) {
			// if (isNaN(increment) || isNaN(interval)) return;
			var self = this;

			if (!this.options.beforeAutoSlide(this.value.toFixed(this.fixed), this.minValue, this.maxValue)) return;
			
			increment = (increment && !isNaN(increment)) ? increment : 1;
			interval = (interval && !isNaN(interval)) ? interval : 100;
			
			if(this.timer) this.clearTimer();
			
			// in 'discrete' type, increment has to be the same as options.tick to make sense
			if(this.options.type === 'discrete') increment = this.options.tick;
			
			this.timer = setInterval(function () {
				self.value += increment;
				self.update();

				if (isFire) self.options.onAutoSlide(self.value.toFixed(self.fixed), self.minValue, self.maxValue);

				if (self.value === self.minValue || self.value === self.maxValue) {
					self.clearTimer();
					self.options.afterAutoSlide(self.value.toFixed(self.fixed), self.minValue, self.maxValue);
				}
			}, interval);

			return this;
		},
		
		// slide x to the left
		slideLeft: function (left, isFire) {
			if(isNaN(left)) return;
			this.$handler[0].style.left = left + 'px';
			this.value = this.leftToValue(left);
			this.update();

			if (isFire) this.options.afterSlide(this.value.toFixed(this.fixed), this.minValue, this.maxValue);

			return this;
		},
		
		// slide x to the right
		slideRight: function (right, isFire) {
			var len = this.$bar.width() - this.$handler[0].offsetWidth;
			this.slideLeft(len - right, isFire);
		},

		// get value by handler.style.left
		leftToValue: function (left) {
			var len = this.$bar.width() - this.$handler[0].offsetWidth,
				value = 0;
			if (this.options.reverse) value = this.minValue + (1 - left / len) * (this.maxValue - this.minValue);
			else value = this.minValue + left / len * (this.maxValue - this.minValue);
			if (value < this.minValue) value = this.minValue;
			if (value > this.maxValue) value = this.maxValue;

			return value;
		},
		
		setTip: function () {
			this.$tip.text(this.value.toFixed(this.fixed));
			return this;
		},
		
		// get handler.style.left by value
		valueToLeft: function(value) {
			var len = this.$bar.width() - this.$handler[0].offsetWidth, 
				left = 0;
			if (this.options.reverse) left = (1 - (value - this.minValue) / (this.maxValue - this.minValue)) * len;
			else left = (value - this.minValue) / (this.maxValue - this.minValue) * len;
			
			return left;
		},

		setHandler: function () {
			if (this.value < this.minValue) this.value = this.minValue;
			if (this.value > this.maxValue) this.value = this.maxValue;
			this.$handler[0].style.left = this.valueToLeft(this.value) + 'px';

			return this;
		}
	});

	$.fn.jSlider = function (settings) {
		this.each(function () {
			var options, slider, arg1, arg2, flag;
			if (!(slider = this.jSlider)) {
				if(settings && typeof settings === 'object') options = $.extend({}, defaults, settings);
				this.jSlider = slider = new JSlider(this, options);
			}
			if (settings && typeof settings === 'object') $.extend(slider.options, settings);

			if (settings && hasOwn.call(settings, 'slideValue')) {
				arg1 = settings.slideValue[0] || settings.slideValue;
				flag = !(settings.slideValue[1] === false);
				return slider.slideValue(arg1, flag);
			}

			if (settings && hasOwn.call(settings, 'slideLeft')) {
				arg1 = settings.slideLeft[0] || settings.slideLeft;
				flag = !(settings.slideLeft[1] === false);
				return slider.slideLeft(arg1, flag);
			}

			if (settings && hasOwn.call(settings, 'slideRight')) {
				arg1 = settings.slideRight[0] || settings.slideRight;
				flag = !(settings.slideRight[1] === false);
				return slider.slideRight(arg1, flag);
			}

			if (settings && hasOwn.call(settings, 'autoSlide')) {
				arg1 = settings.autoSlide[0];
				arg2 = settings.autoSlide[1];
				flag = !(settings.autoSlide[2] === false);
				return slider.autoSlide(arg1, arg2, flag);
			}

			return slider.reset();
		})
	};
	$.fn.jSlider.Constructor = JSlider;
});