/// <reference path="../../../typings/tsd.d.ts" />

const gandalf = require('gandalf-crud');
const pouchdb = require('pouchdb');
pouchdb.plugin(require('pouchdb-find'));
pouchdb.plugin(require('pouchdb-upsert'));

export default angular.module('app.admin', ['ngMaterial'])
    .controller('AdminController', AdminController)
    .name


AdminController.$inject = ['$mdDialog', '$scope','sampleData','commonLib'];
function AdminController($mdDialog,$scope,sampleData,commonLib) {
    var _this = this;
	var	objClass = {};
	var dbCatalogs = new pouchdb('catalogs');
	var dbCompanies = new pouchdb('companies');
    var dbUserProfile = new pouchdb('userProfile');
	
	dbUserProfile.createIndex({fields:['_id']})
	.then(idx=>{
		dbUserProfile.find({selector:{_id:'userProfile'}})
		.then(res=>{
			_this.userProfile = res.docs[0];
			$scope.$apply();
			dbCompanies.createIndex({fields:['user']})
			.then(idx=>{
				dbCompanies.find({selector:{user:_this.userProfile}})
				.then(res=>{
					var _companies = [];
					res.docs.forEach(doc=>{
						_companies.push(doc);
					});
					_this.companies = _companies;
					$scope.$apply();
				})
			});
		});
	})
	dbCatalogs.allDocs({include_docs:true})
	.then(res=>{
		var _catalogs = [];
		res.rows.forEach(row=>{
			_catalogs.push(row.doc);
		})
		_this.catalogs = _catalogs;
		console.log('THS CATALOGS',_this.catalogs);
		$scope.$apply();
		return _catalogs;
	})
	.catch(err=>{
		console.log('ERR',err);
	})

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
		var _companyId = commonLib.createId('company'),
			obj = {
				name:$scope.company.name,
				address:$scope.company.address,
				companyId:_companyId
			};
		sampleData.createItem('companies',{_id:_companyId,companyId:_companyId,name:$scope.company.name,address:$scope.company.address,user:_this.userProfile})	
		$mdDialog.hide(obj);
	}
	

/*	dbCompanies.allDocs({include_docs:true})
	.then(res=>{
		var _companies = [];
		res.rows.forEach(row=>{
			_companies.push(row.doc);
			console.log('COMPANY',row.doc);
		})
		_this.companies = _companies;
		$scope.$apply();
	});
*/	
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
		var _catalogId = commonLib.createId('catalog')
		sampleData.createItem('catalogs',{_id:_catalogId,catalogId:_catalogId,name:catalog.name});
		$mdDialog.hide({name:catalog.name,catalogId:_catalogId})
	}
	
}
