/// <reference path="../../../typings/tsd.d.ts" />

const gandalf = require('gandalf-crud');
export default angular.module('app.admin', ['ngMaterial'])
    .controller('AdminController', AdminController)
    .name


AdminController.$inject = ['$mdDialog', '$scope'];
function AdminController($mdDialog,$scope) {
    var _this = this,
		objClass = {};
    _this.hello = 'Admin Page'
	gandalf.listAsync({tableName:'gandalf-catalogs',id:'catalogId'})
	.then(function(res){
		_this.catalogs = res.Items
		$scope.$apply()
	})
    _this.addStoreDialog = function(){
		_this.dialogTitle = 'ADD STORE'
        $mdDialog.show({
            targetEvent: window,
            templateUrl: "components/admin/addStoreDialog.html",
            controller: AdminController,
            controllerAs:'dialog',
            clickOutsideToClose:true
        });
    };
	_this.addCompany = function(){
		$mdDialog.show({
			templateUrl: 'components/admin/addCompany.html',
			parent: angular.element(document.body),
			clickOutsideToClose:true
		})
		.then(function(company){
			_this.companies.push(company)
		})
		console.log('openDialog');
	}
	_this.saveCompany = function(){
		var objClass = {tableName:'gandalf-companies',id:'companyId'},
			_companyId = _this.createId('company'),
			obj = {
				name:$scope.company.name,
				address:$scope.company.address,
				companyId:_companyId
			};
			
		gandalf.createAsync(objClass,obj);
		$mdDialog.hide(obj);
	}
	objClass = {tableName:'gandalf-companies'}
    gandalf.listAsync(objClass)
    .then(function(res){
		$scope.$apply(_this.companies = res.Items);
    }).catch(function(err){
		console.log(err);
    });

	_this.addSite = function(){
		$mdDialog.show({
			templateUrl: 'components/admin/addSite.html',
			parent: angular.element(document.body),
			clickOutsideToClose:true
		})
		console.log('openDialog');
	}
	_this.addPos = function(){
		$mdDialog.show({
			templateUrl: 'components/admin/addPos.html',
			parent: angular.element(document.body),
			clickOutsideToClose:true
		})
		console.log('openDialog');
	}
	
	_this.addCatalog = function(){
		$mdDialog.show({
			templateUrl: 'components/admin/addCatalog.html',
			parent: angular.element(document.body),
			clickOutsideToClose:true,
			controller:['$scope','catalog',function($scope,catalog){
				$scope.catalog = _this.catalog;
			}],
			controllerAs:'catalog',
			locals:{catalog:_this.catalog}
		})
		.then(function(catalog){
			_this.catalogs.push(catalog)
		})
		console.log('openDialog');
	}
	
	_this.saveCatalog = function(catalog){
		var _catalogId = _this.createId('catalog')
		gandalf.createAsync({
			tableName:'gandalf-catalogs',id:'catalogId'
		},{
			name:catalog.name,
			catalogId:_catalogId
		})
		.then(function(res){
			console.log('Create Catalog success',res)
		})
		.catch(function(err){
			console.log('Create Catalog Error',err)
		})
		$mdDialog.hide({name:catalog.name,catalogId:_catalogId})
	}
	
    _this.editStoreDialog = function(item){
		_this.storeId = item.storeId;
		_this.storeName = item.name;
		_this.storeAddress = item.address;
		_this.dialogTitle = 'EDIT STORE'
		console.log("itemName",item.name);
        $mdDialog.show({
            targetEvent: window,
            templateUrl: "components/admin/editStoreDialog.html",
            controller: AdminController,
            controllerAs:'dialog',
            clickOutsideToClose:true
        });
    };
    objClass = {tableName:'gandalf-stores'}
    gandalf.listAsync(objClass)
    .then(function(res){
		$scope.$apply(_this.items = res.Items);
		console.log('res',res);
    });
	_this.saveStore = function(){
		var objClass = {tableName:'gandalf-stores'},
			obj = {
				storeId:this.storeId,
				name:this.storeName,
				address:this.storeAddress
			};
		gandalf.createAsync(objClass,obj)
		.then(function(res){
			$mdDialog.hide();
			console.log(res);
		})
		.catch(function(err){
			console.log('Error create store',err);
		});
	}
	_this.updateStore = function(){
		var objClass = {tableName:'gandalf-stores',id:'storeId'},
			obj = {
				storeId:this.storeId,
				name:this.storeName,
				address:this.storeAddress
			}
			gandalf.updateAsync(objClass,obj)
			.then(function(res){
				$mdDialog.hide();
			})
			.catch(function(err){
				console.log('Error update',err);
			});
	}
	_this.removeStore = function(item){
		var objClass = {tableName:'gandalf-stores',id:'storeId'},
			obj = {
				storeId:item.storeId,
				name:item.storeName,
				address:item.storeAddress
			}
		gandalf.removeAsync(objClass,obj)
		.then(function(res){
			var index = _this.items.indexOf(obj);
			_this.items.splice(index,1);
			$scope.$apply(_this.items);
			console.log('remove success',item.name);
		})
		.catch(function(err){
			console.log('Error remove',err);
		});
	}
	_this.closeDialog = function(){
		$mdDialog.hide();
	}
	
	_this.createId = function(obj){
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
		}
		return prefix+dt+mt+yr+hr+mn+sc;		
	}
}
