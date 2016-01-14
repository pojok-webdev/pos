
export default angular.module('app.users.detail', [])
	.controller('UsersDetailController', UsersDetailController)

UsersDetailController.$inject = ['$stateParams'];

function UsersDetailController($stateParams) {
	this.userId = $stateParams.userId;
	this.fullname = "Louis Larry";
	this.phone = "+628118302699";
}
	
	
	