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
		console.log('degToRad('+deg+')='+(deg * (Math.PI / 180.0)));
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
			context.fillStyle = settings.colors[i % settings.colors.length];
			drawSlice(slices[i], deg, degPerSlice, context);
			deg += degPerSlice;
		}
	};
	
	var drawSlice = function(slice, offsetDegrees, sizeDegrees, context) {
		var color = color || 'red';
		console.log("drawSlice(" + slice.name + ", " + offsetDegrees + ", " + sizeDegrees + ")");

		// Start at center
		context.moveTo(center.x, center.y);
		
		// First point on circle
		var x0 = center.x + Math.cos(degToRad(offsetDegrees));
		var y0 = center.y + Math.sin(degToRad(offsetDegrees));
		context.lineTo(x0, y0);
		
		// Second point on circle (easy!)
		var x2 = center.x + Math.cos(degToRad(offsetDegrees + sizeDegrees));
		var y2 = center.y + Math.sin(degToRad(offsetDegrees + sizeDegrees));
		
		// (Note: this shit didn't work. Just using arc() instead.)
		// Tangent point (x0,y0-x1,y1 is tangent to arc, x1,y1-x2,y2 is tangent to arc)
		// Angle a is half sizeDegrees, used for computing new radius
		var a = degToRad(sizeDegrees / 2);
		// New radius - radius from center to tangent point
		var r1 = (radius * Math.sin(a)) + (radius * Math.sin(a) * Math.atan(a));
		// Tangent point coords
		var x1 = r1 * Math.cos(degToRad(offsetDegrees + (sizeDegrees / 2)));
		var y1 = r1 * Math.cos(degToRad(offsetDegrees + (sizeDegrees / 2)));
		//context.arcTo(x1, y1, x2, y2, radius);

		context.arc(center.x, center.y, radius, degToRad(offsetDegrees), degToRad(offsetDegrees + sizeDegrees));
		
		// Finish at center
		context.lineTo(center.x, center.y);
		context.closePath();
		
		context.stroke();
		context.fill();
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
