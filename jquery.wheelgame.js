/**
 * Wheel Game - jQuery plugin for a "Wheel of Fortune" (tm) style game
 */

if (console == undefined) {
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
	}, settings || {});
	
	var num = this.children().length;
	return this.children().each(function() {
		var container = this;
		var rot = (Math.random() * 360);
		var speed = Math.random() * 10 - 5;
		var refresh = (1/30) * 1000; // 30hz
		$(this).setRotation(rot);
		var upd = function() {
			$(container).setRotation(rot);
			rot += speed;
			setTimeout(upd, refresh);
		};
		upd();
	});
};
