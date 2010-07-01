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
		colors: ['yellow', 'green', 'blue', 'orange', 'gray', 'white', 'red', 'pink', 'aqua'],
		borderColor: 'black',
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
	var dragging = false;
	var dragLastAngle = 0;
	var dragLastTime = 0;
	var dragAngleOffset = 0;
	
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
		canvas.width = canvas.width; // clear canvas
		context.strokeStyle = settings.borderColor;
		context.fillStyle = 'white';
		context.lineWidth = 3;
		
		var degPerSlice = 360 / slices.length;
		var deg = offsetDegrees || 0;
		// Draw outer circle
		context.beginPath();
		context.arc(center.x, center.y, radius, 0, Math.PI * 2, true);
		context.stroke();
		context.closePath();
		
		// Draw slices
		for (var i = 0; i < slices.length; i++) {
			drawSlice(slices[i], deg, degPerSlice, context, settings.colors[i % settings.colors.length], null);
			deg += degPerSlice;
		}
	};
	
	var drawSlice = function(slice, offsetDegrees, sizeDegrees, context, fillStyle, strokeStyle, textColor) {
		//console.log("drawSlice(" + slice.name + ", " + offsetDegrees + ", " + sizeDegrees + ", "+ context + ", " + fillStyle + ", " + strokeStyle + ", " + textColor + ")");

		fillStyle = fillStyle || 'white';
		strokeStyle = strokeStyle || 'black';
		textColor = textColor || 'black';
		
		context.fillStyle = fillStyle;
		context.strokeStyle = strokeStyle;

		// Draw pie slice
		context.beginPath();
		context.moveTo(center.x, center.y);
		context.arc(center.x, center.y, radius, degToRad(offsetDegrees), degToRad(offsetDegrees + sizeDegrees), 0);
		context.lineTo(center.x, center.y);
		context.stroke();
		context.fill();
		context.closePath();
		
		// Draw text
		context.fillStyle = 'black';
		context.rotate(degToRad(offsetDegrees + (sizeDegrees / 2)));
		context.translate(center.x + (radius / 2), center.y);
		context.textAlign = 'center';
		context.fillText(slice.name, 0, 0);
		
		// Reset transform (load identity)
		context.setTransform(1, 0, 0, 1, 0, 0);
	};
	
	var updateDrag = function(pointFromCenter) {
		dragLastTime = new Date().getTime();
		dragLastAngle = radToDeg(Math.atan(pointFromCenter.y / pointFromCenter.x));
		if (pointFromCenter.x >= 0 && pointFromCenter.y >= 0) {
			// This quadrant is already correct
		} else if (pointFromCenter.x <= 0) {
			// Both quadrants same
			dragLastAngle += 180;
		} else {
			dragLastAngle += 360;
		}
	};
	
	$(canvas).mousedown(function(e) {
		var mousePoint = new Point(e.pageX - this.offsetLeft, e.pageY - this.offsetTop);
		var pointFromCenter = new Point(mousePoint.x - center.x, mousePoint.y - center.y);
		var oldDragAngle = dragLastAngle;

		dragging = true;
		updateDrag(pointFromCenter);
		dragAngleOffset = (360 + dragLastAngle - oldDragAngle) % 360;
	});
	
	$(canvas).mouseup(function(e) {
		if (!dragging) {
			return;
		}
		dragging = false;
		
		// TODO: Start animation
	});
	
	$(canvas).mousemove(function(e) {
		if (!dragging) {
			return;
		}
		
		var mousePoint = new Point(e.pageX - this.offsetLeft, e.pageY - this.offsetTop);
		var pointFromCenter = new Point(mousePoint.x - center.x, mousePoint.y - center.y);

		updateDrag(pointFromCenter);
		drawWheel((360 + dragLastAngle - dragAngleOffset) % 360);
		console.log('Continued drag with angle: ' + dragLastAngle);
	});
	
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
		var elem = this;
		var slice = {url: null, name: $(this).text()};
		if ($(this).find('a').length) {
			slice.url = $(this).find('a').attr('href');
		}
		slices.push(slice);
	});
	
	if (settings.shuffle) {
		shuffle(slices);
	}
	
	drawWheel(0);
};
