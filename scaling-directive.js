export default function scalableStageDirective($window, $log) {
	'ngInject';
	// use channel based logging where present
	$log = $log.forChannel ? $log.forChannel('scalable-stage') : $log;

	return {
		restrict: 'AE',
		link    : function (scope, element) {
			var windowElement = angular.element($window);

			// clear transform, initialise to some value
			element.css({
				'transform-origin'        : '0 0',
				'-ms-transform-origin'    : '0 0',
				'-webkit-transform-origin': '0 0',
				'-moz-transform-origin'   : '0 0',
				'-o-transform-origin'     : '0 0',
				'transform'               : 'scale(0)',
				'-o-transform'            : 'scale(0)',
				'-ms-transform'           : 'scale(0)',
				'-webkit-transform'       : 'scale(0)',
				'-moz-transform'          : 'scale(0)'
			});

			// scale initially and on resize
			windowElement.bind('resize', scalePageNow);
			scalePageNow();

			// detach listeners on distroy
			scope.$on('$destroy', dispose);

			function dispose() {
				windowElement.unbind('resize', scalePageNow);
			}

			function scalePageNow() {
				var minHeight = element.height(),
					minWidth  = element.width();

				// avoid zero denominators
				if (minHeight && minHeight) {
					var winH        = windowElement.height(),
						winW        = windowElement.width(),
						widthScale  = winW / minWidth,
						heightScale = winH / minHeight,
						scale       = (widthScale < heightScale) ? widthScale : heightScale,
						left        = Math.round(winW / 2 - scale * minWidth / 2);

					$log.debug('scale:', formatFloat(scale), 'left:', formatInt(left));

					element.css({
						'left'             : left + 'px',
						'transform'        : 'scale(' + scale + ')',
						'-o-transform'     : 'scale(' + scale + ')',
						'-ms-transform'    : 'scale(' + scale + ')',
						'-webkit-transform': 'scale(' + scale + ')',
						'-moz-transform'   : 'scale(' + scale + ')'
					});
				}
			}
		}
	};
}

//module.exports = scalableStageDirective;

function formatFloat(value) {
	return (String(Math.round(value * 1000) / 1000) + '000').slice(0, 5);
}

function formatInt(value) {
	return ('   ' + value).slice(-3);
}