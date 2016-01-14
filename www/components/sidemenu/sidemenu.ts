/// <reference path="../../../typings/tsd.d.ts" />

export default angular.module('app.sidemenu', [])
    .directive('gandalfSidemenu', gandalfSidemenu)
    .name

gandalfSidemenu.$inject = ['$mdSidenav'];

function gandalfSidemenu($mdSidenav) {
    return {
	restrict: 'EA',
	template: `<ng-md-icon icon="menu" style="fill: white" size="26"></ng-md-icon>`,
	link: function($scope, element, attrs) {
	    element.bind('click', function() {
		console.log('Clickety-click');
		$mdSidenav('left').toggle();
	    });
	    element.bind('mouseover', function() {
		element.css('cursor', 'pointer');
	    });
	}
    }

}
