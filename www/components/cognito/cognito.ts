/// <reference path="../../../typings/tsd.d.ts" />

export default angular.module('app.cognito', [])
.controller('CognitoController', CognitoController)

CognitoController.$inject = ['$scope'];

function CognitoController($scope) {
this.myname = 'cognito';
}
