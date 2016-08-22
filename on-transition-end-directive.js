/**
 * A small directive to detect the animation end event on element.
 * It will also call the function set in parent controller on
 * `on-transition-end` element attribute.
 *
 * @author Shameer
 * @module common
 */

/**
 * Detect browser supported animation end event name
 * @return {[type]} [description]
 */
function whichTransitionEvent() {
    var t,
        el = document.createElement('fakeelement');

    var animations = {
        'WebkitTransition': 'webkitTransitionEnd',
        'MozTransition': 'transitionend',
        'OTransition': 'oTransitionEnd otransitionend',
        'transition': 'transitionend'
    };

    for (t in animations) {
        if (el.style[t] !== undefined) {
            return animations[t];
        }
    }
}

/**
 * Directive to detect `End of transition`
 *
 * @return {[type]} [description]
 */
export default function onTransitionEnd() {
    return {
        restrict: 'A',
        replace: false,
        scope: {onTransitionEnd: '&'},
        link: function ($scope, $element) {
            var transitionEvent = whichTransitionEvent();
            // On animation end call the `onTransitionEnd` function
            $($element).on(transitionEvent, $scope.onTransitionEnd);

        }
    };
}