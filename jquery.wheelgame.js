/**
 * Wheel Game - jQuery plugin for a "Wheel of Fortune" (tm) style game
 */

if (console == undefined || console.log == undefined) {
	var console = {
		log: function() {}
	};
}

$.fn.setRotation = function(degrees) {
	degrees = parseInt(degrees);
	// TODO: Add MSIE support?
	return $(this).css('-webkit-transform', 'rotate('+degrees+'deg)').css('-moz-transform', 'rotate('+degrees+'deg)');
};

$.fn.wheelgame = function(settings) {
	settings = $.extend({
		shuffle: false,
		colors: ['yellow', 'green', 'blue', 'yellow', 'orange', 'gray', 'white']
	}, settings || {});
	
	// Point object
	var Point = function(x, y) {
		this.x = x;
		this.y = y;
	};
	Point.prototype = new Object();
	Point.prototype.constructor = Point;
	
	// Hide parent DIV and create our canvas
	this.hide();
	var size = {width: this.width(), height: this.height()};
	var center = new Point(size.width / 2, size.height / 2);
	//var center = {x: size.width / 2, y: size.height / 2};
	var radius = ((size.width > size.height ? size.height : size.width) / 2) * 0.9;
	this.after('<canvas id="wheelgame_canvas" width="' + size.width + '" height="' + size.height + '"></canvas>');
	var canvas = $('#wheelgame_canvas').get(0);
	var slices = [];
	
	var degToRad = function(deg) {
		return deg * (Math.PI / 180.0);
	};
	var radToDeg = function(rad) {
		return rad * (180.0 / Math.PI);
	};
	
	var drawWheel = function(offsetDegrees) {
		if (!canvas.getContext) {
			console.log('Unable to use canvas');
			return;
		}
		var context = canvas.getContext('2d');
		context.strokeStyle = 'black';
		context.lineWidth = 3;
		
		var degPerSlice = 360 / slices.length;
		var deg = offsetDegrees || 0;
		// Draw outer circle
		context.beginPath();
		context.arc(center.x, center.y, radius, 0, Math.PI * 2, true);
		context.closePath();
		context.stroke();
		
		// Draw slices
		for (var i = 0; i < slices.length; i++) {
			drawSlice(slices[i], deg, degPerSlice, context, settings.colors[i % settings.colors.length], null);
			deg += degPerSlice;
			//break;
		}
	};
	
	var drawSlice = function(slice, offsetDegrees, sizeDegrees, context, fillStyle, strokeStyle) {
		if (fillStyle) {
			context.fillStyle = fillStyle;
		}
		if (strokeStyle) {
			context.strokeStyle = strokeStyle;
		}
		console.log("drawSlice(" + slice.name + ", " + offsetDegrees + ", " + sizeDegrees + ")");

		// Draw pie slice
		context.moveTo(center.x, center.y);
		context.arc(center.x, center.y, radius, degToRad(offsetDegrees), degToRad(offsetDegrees + sizeDegrees));
		context.closePath();
		context.stroke();
		context.fill();
		
		// Draw text
		context.fillStyle = 'black';
		context.strokeStyle = 'black';
		//context.rotate(degToRad(offsetDegrees + (sizeDegrees / 2)));
		context.translate(center.x + (radius / 2), center.y);
		context.textAlign = 'center';
		context.fillText(slice.name, 0, 0);
		context.closePath();
		
		// Reset transform (load identity)
		context.setTransform(1, 0, 0, 1, 0, 0);
	};
	
	var shuffle = function(arr) {
		// Fisher-Yates shuffle
		for (var i = arr.length - 1; i; --i) {
			j = parseInt(Math.random() * i);
			x = arr[i];
			arr[i] = arr[j];
			arr[j] = x;
		}
	};
	
	var num = this.children().length;
	this.children().each(function() {
		var slice = {url: null, name: $(this).text()};
		if ($(this).find('a').length) {
			slice.url = $(this).find('a').attr('href');
		}
		slices.push(slice);
	});
	
	if (settings.shuffle) {
		shuffle(slices);
	}
	shuffle(settings.colors);
	
	drawWheel();
};
