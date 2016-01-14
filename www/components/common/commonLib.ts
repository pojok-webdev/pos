const pouchdb = require('pouchdb');
export default angular.module('app.commonLib', ['ngMaterial'])
	.service('commonLib', commonLib)
    .name

commonLib.$inject = ['$rootScope','$mdDialog'];
function commonLib($rootScope,$mdDialog){
	var that = this;
    this.showAlert = function(title,content) {
      var alert = $mdDialog.alert({
        title: title,
        content: content,
        ok: 'Close'
      });
      $mdDialog
        .show( alert )
        .finally(function() {
          alert = undefined;
        });
    }
	
	this.createId = function(obj){
		var curdt = new Date(),
			dt = curdt.getDate(),
			mt = curdt.getMonth(),
			yr = curdt.getFullYear(),
			hr = curdt.getHours(),
			mn = curdt.getMinutes(),
			sc = curdt.getSeconds(),
			prefix = '';
		switch(obj){
			case 'company':
			prefix = 'c';
			break;
			case 'store':
			prefix = 's';
			break;
			case 'register':
			prefix = 'r';
			break;
			case 'product':
			prefix = 'p';
			break;
			case 'catalog':
			prefix = 'k';
			break;
			case 'orders':
			prefix = 'o';
			break;
		}
		return prefix+dt+mt+yr+hr+mn+sc;
	}
}