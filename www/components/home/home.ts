/// <reference path="../../../typings/tsd.d.ts" />

const angular = require('angular');
// const HomeController = require('./home.controller.ts');

export default angular.module('app.home', [
    require('angular-material')
])
    .controller('HomeController', HomeController)

HomeController.$inject = ['$mdSidenav'];

function HomeController($mdSidenav) {
    this.hello = 'world';

    this.openLeftMenu = function() {
	console.log('openLeftMenu');
	$mdSidenav('left').toggle();
    }
}
