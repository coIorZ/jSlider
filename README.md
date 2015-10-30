# jSlider
a simple slider

## Installation
to use it include `jSlider.js`, `jQuery` is required

	<script src="jSlider.js"></script>

## Usage
call jSlider via Javascript

	<div class="slider"></div>	

	$('.slider').jSlider();
	
## Options
### Variable
`type` - `'continuous'` or `'discrete'`, determine hwo handler moves on slider

`width` - set width for slider

`minValue` - set min value, defaults to 0, left of slider if `reverse` is false

`maxValue` - set max value, defaults to 100, right of slider if `reverse` is false

`value` - set value when slider is initiated

`handlerScale` - size scale of handler to slider, defaults to 1.3

`isTip` - if show value above handler, defaults to false

`isTick` - if show ticks, defaults to false, will be set true if `type` is discrete

`tick` - interval of ticks, defaults to 1

`reverse` - if max value on the left and min value on the right

`fixed` - toFixed level of value

`windowContext` - reference to window

`documentContext` - reference to document

### Callback
all callbacks are passed three parameters
+ `value` - current value of slider
+ `minValue` - min value
+ `maxValue` - max value

`beforeLoad` - called before slider is displayed, if this function returns false, slider will not display

`onLoad` - called when slider displays

`beforeSlide` - called before handler slides, if this function returns false, handler will not slide

`onSlide` - called when handler is dragged and sliding

`afterSlide` - called when mouse up

`beforeAutoSlide` - called before auto sliding, if this function returns false, handler will not auto slide

`onAutoSlide` - called when handler is auto sliding

`afterAutoSlide` - called when handler stops auto sliding

### Method
`slideValue(x, flag)` - slide to the given value x, if flag is false, will not trigger callback `afterSlide`, defaults to true

`slideLeft(x, flag)` - slide x to the left of slider, if flag is false, will not trigger callback `afterSlide`, defaults to true

`slideRight(x, flag)` - slide x to the right of slider, if flag is false, will not trigger callback `afterSlide`, defaults to true

`autoSlide(increment, interval, flag)` - set increment and interval of auto slide,  if flag is false, will not trigger callback `onAutoSlide`, defaults to true.
if `type` is `'discrete'`, increment will be set the same as `tick`

## Example

	$slider.jSlider({
		// type: 'discrete',
		width: 300,
		isTip: true,
		// isTick: true,
		// reverse: true,
		// fixed: 0,
		// tick: 0.5,
		minValue: 1,
		maxValue: 12,
		value: 5,
		afterSlide: function(value) {
			$output.text(value);	
		},
		onAutoSlide: function(value) {
			$output.text(value);
		},
		afterAutoSlide: function(value) {
			$slider.jSlider({slideLeft: 0});
		}
	});
	
	$btn.on('click', function(e) {
		$slider.jSlider({autoSlide: [0.1, 100]});
	});