const gandalf = require('gandalf-crud');
const pouchdb = require('pouchdb');
pouchdb.plugin(require('pouchdb-find'));
pouchdb.plugin(require('pouchdb-upsert'));

export default angular.module('app.company', ['ngMaterial'])
    .controller('CompanyController', CompanyController)
    .name


CompanyController.$inject = ['$mdDialog', '$scope','$stateParams','$location','commonLib','sampleData'];
function CompanyController($mdDialog,$scope,$stateParams,$location,commonLib,sampleData) {
    var _this = this;
    var dbCompanies = pouchdb('companies');
    var dbStores = pouchdb('stores');
    var dbCatalogs = pouchdb('catalogs');
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
                });
            });
		});
	})
/*    dbCompanies.allDocs({include_docs:true})
    .then(res=>{
        var _companies = [];
        res.rows.forEach(row=>{
            _companies.push(row.doc);
        });
        _this.companies = _companies;
        $scope.$apply();
    });
*/
    dbCompanies.createIndex({
        fields:['companyId']
    })
    .then(idx=>{
        dbCompanies.find({selector:{companyId:$stateParams.companyId}})
        .then(res=>{
            console.log('CUR COMPANY',res);
            _this.company = res.docs[0];
            $scope.$apply();
            dbStores.createIndex({fields:['companyId']})
            .then(idx=>{
                dbStores.find({selector:{companyId:$stateParams.companyId}})
                .then(res=>{
                    var _stores = [];
                    res.docs.forEach(doc=>{
                        _stores.push(doc);
                    })
                    _this.stores = _stores;
                    $scope.$apply();
                });
            });
        });
    });
    /*gandalf.readAsync({
        tableName:'gandalf-companies',id:'companyId'
    },{
        companyId:$stateParams.companyId
    })
    .then(function(res){
        $scope.$apply(_this.company = res.Item)
        console.log('Res',res.Item)
        return gandalf.listByAsync('gandalf-stores','companyId',res.Item.companyId)
        .then(function(stores){
            $scope.$apply(_this.stores = stores.Items);
        })
        .catch(function(errstores){
            console.log('Error get stores',errstores)
        });
    })
    .catch(function(err){
        console.log(err);
    });*/
    dbCatalogs.allDocs({include_docs:true})
    .then(res=>{
        var _catalogs = [];
        res.rows.forEach(row=>{
            _catalogs.push(row.doc);
        });
        _this.catalogs = _catalogs;
        $scope.$apply();
    });
    /*gandalf.listAsync({tableName:'gandalf-catalogs',id:'catalogId'})
    .then(function(res){
        console.log('Items',res.Items)
        _this.catalogs = res.Items
        $scope.$apply()
    })
    .catch(function(err){
        console.log('Error listby',err)
    })*/
    
    _this.addCompany = function(){
        $mdDialog.show({
            templateUrl: 'components/company/addCompany.html',
            parent: angular.element(document.body),
            clickOutsideToClose:true,
			controller:['$scope','company',function($scope,company){
				//$scope.company = _this.company;
                this.saveCompany = function(){	
                    console.log('CONMPANY SAVE INVOKED');	
                    var _companyId = commonLib.createId('company'),
                        obj = {
                            name:$scope.company.name,
                            address:$scope.company.address,
                            companyId:_companyId,
                            _id:_companyId,
                            user:_this.userProfile
                        };
                    sampleData.createItem('companies',obj)	
                    $mdDialog.hide(obj);
                }
                
			}],
			controllerAs:'cmp',
			locals:{company:_this.company}
        })
        .then(obj=>{
            _this.companies.push(obj);
        })
        console.log('openDialog');
    }
    
    _this.addSite = function(){
        $mdDialog.show({
            templateUrl: 'components/company/addSite.html',
            parent: angular.element(document.body),
            clickOutsideToClose:true,
			controller:['$scope','company',function($scope,company){
				$scope.company = _this.company;
			}],
			controllerAs:'company',
			locals:{company:_this.company}
        })
        .then(function(res){
            console.log('store before push',_this.stores)
            _this.stores.push(res)
            console.log('store after push',_this.stores)
        })
        console.log('openDialog');
    }
    
    _this.saveSite = function(store){
        var objsite = store;
        var _storeId = commonLib.createId('store');
        console.log('store to save',store,_this.company.companyId)
        objsite._id = _storeId;
        objsite.companyId = _this.company.companyId;
        objsite.storeId = _storeId;
        dbStores.put(objsite)
        .then(res=>{
            $mdDialog.hide(objsite);
        })
        .catch(err=>{
            console.log('ERR CREATE SITE',err);
        });
/*        gandalf.createAsync({tableName:'gandalf-stores',id:'storeId'},objsite)
        .then(function(res){
            console.log('Save Site uccess',res)
            $mdDialog.hide(objsite);
        })
        .catch(function(err){
            console.log('Error save Site',err)
        });*/
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
            clickOutsideToClose:true
        })
        console.log('openDialog');
    }
    _this.editCompany = function(){
        $mdDialog.show({
            templateUrl: 'components/company/editCompany.html',
            parent: angular.element(document.body),
            clickOutsideToClose:true,
			controller:['$scope','company',function($scope,company){
				$scope.company = _this.company;
			}],
			controllerAs:'company',
			locals:{company:_this.company}
        })
        .then(function(obj){
            console.log('Res of Dialog',obj.company);
            if(obj.answer==='remove'){
                var _index = _this.companies.indexOf(obj.company);
                _this.companies.splice(_index,1);
                $location.path("/admin");

            }else{
                _this.company=obj.company
            }
        })
        console.log('company to edit',_this.company)
    }
    _this.update = function(company){
        console.log('Update Company',company)
        dbCompanies.upsert(company.companyId,function(doc){
            doc.name = company.name;
            doc.address = company.address;
            doc.phone = company.phone;
            doc.email = company.email;
            return doc;
        })
        .then(res=>{
            console.log('UPDATE COMPANY RES',res);
            $mdDialog.hide({answer:'edit',company:company});
        })
        .catch(err=>{
            console.log('ERROR UPDATE COMPANY',err);
        });
    }
	
    _this.remove = function(company){
        dbStores.createIndex({fields:['companyId']})
        .then(idx=>{
            dbStores.find({selector:{companyId:$stateParams.companyId}})
            .then(res=>{
                if(res.docs.length>0){
                    console.log('store(s) exist(s), cannot remove company');
                }else{
                    dbCompanies.createIndex({fields:['companyId']})
                    .then(idx=>{
                        dbCompanies.find({selector:{companyId:$stateParams.companyId}})
                        .then(res=>{
                            var _company = res.docs[0]
                            dbCompanies.remove({_id:$stateParams.companyId,_rev:_company._rev})
                            .then(res=>{
                                console.log('SUKSES REMOVE COMPANY',res);
                                $mdDialog.hide({answer:'remove',company:_company});
                            })
                            .catch(err=>{
                                console.log('ERROR REMOVE COMPANY',err);
                            });
                        });
                    });
                }
            });
        });
    }
    
    _this.showAlert = function(title,content) {
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
}