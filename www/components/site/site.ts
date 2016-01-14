const gandalf = require('gandalf-crud');
const pouchdb = require('pouchdb');
pouchdb.plugin(require('pouchdb-find'));
pouchdb.plugin(require('pouchdb-upsert'));

export default angular.module('app.site', ['ngMaterial'])
    .controller('SiteController', SiteController)
    .name
SiteController.$inject = ['$mdDialog', '$scope','$stateParams','$location','commonLib','sampleData'];
function SiteController($mdDialog,$scope,$stateParams,$location,commonLib,sampleData) {
    var _this = this;
    var dbCompanies = pouchdb('companies');
    var dbStores = pouchdb('stores');
    var dbRegisters = pouchdb('registers');
    var dbCatalogs = pouchdb('catalogs');
    var dbUserProfile = pouchdb('userProfile');    
    
    dbUserProfile.allDocs({include_docs:true})
    .then(res=>{
        _this.userProfile = res.rows[0].doc;
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
    })
    /*dbCompanies.allDocs({include_docs:true})
    .then(res=>{
        var _companies = [];
        res.rows.forEach(row=>{
            _companies.push(row.doc);
        })
        _this.companies = _companies;
        $scope.$apply();
    });*/

    dbStores.createIndex({fields:['storeId']})
    .then(idx=>{
        dbStores.find({selector:{storeId:$stateParams.storeId}})
        .then(res=>{
            _this.store = res.docs[0];
            console.log('_THIS SITE',_this.site);
            $scope.$apply();
            dbCompanies.createIndex({fields:['companyId']})
            .then(idx=>{
                dbCompanies.find({selector:{companyId:_this.site.companyId}})
                .then(res=>{
                    _this.company = res.docs[0];
                    $scope.$apply();
                    return _this.company;
                })
                .then(res=>{
                    dbStores.createIndex({fields:['companyId']})
                    .then(idx=>{
                        dbStores.find({selector:{companyId:res.companyId}})
                        .then(res=>{
                            var _stores = [];
                            res.docs.forEach(doc=>{
                                _stores.push(doc);
                            })
                            _this.stores = _stores;
                            $scope.$apply();
                        })
                    })
                });
            })
        return res.docs[0];
        })
        .then(res=>{
            _this.site = res;
            $scope.$apply();
            console.log('RES RS',res);
            dbRegisters.createIndex({fields:['storeId']})
            .then(idx=>{
                dbRegisters.find({selector:{storeId:res.storeId}})
                .then(res=>{
                    var _registers = [];
                    res.docs.forEach(doc=>{
                        _registers.push(doc);
                    })
                    _this.registers = _registers;
                    $scope.$apply();
                });
            })
        });
    })
    
    dbCatalogs.allDocs({include_docs:true})
    .then(res=>{
        var _catalogs = [];
        res.rows.forEach(row=>{
            _catalogs.push(row.doc);
        })
        _this.catalogs = _catalogs;
        $scope.$apply();
    })
    
    _this.addCompany = function(){
        $mdDialog.show({
            templateUrl: 'components/company/addCompany.html',
            parent: angular.element(document.body),
            clickOutsideToClose:true,
			controller:['$scope',function($scope){
				$scope.site = _this.site;
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
			locals:{}

        })
        .then(obj=>{
            _this.companies.push(obj);
        })
        console.log('openDialog');
    }
    _this.addsite = function(){
        $mdDialog.show({
            templateUrl: 'components/admin/addSite.html',
            parent: angular.element(document.body),
            clickOutsideToClose:true
        })
        .then(function(site){
            
        })
        console.log('openDialog');
    }
    _this.updateSite = function(store){
        var _obj = store;
        _obj.storeId = $stateParams.storeId;
        dbStores.createIndex({fields:['storeId']})
        .then(idx=>{
            dbStores.find({selector:{storeId:$stateParams.storeId}})
            .then(res=>{
                var _store = res.docs[0];
                store._id= _store._id;
                store._rev = _store._rev;
                dbStores.put(store)
                .then(res=>{
                    console.log('UPDATE SITE SUCCESS',res);
                    var obj = {store:_obj,answer:'update'}
                    $mdDialog.hide(obj);
                })
                .catch(err=>{
                    console.log('ERROR SITE UPDATE',err);
                });
            });
        });
    }
    _this.addPos = function(){
        $mdDialog.show({
            templateUrl: 'components/site/addPos.html',
            parent: angular.element(document.body),
            clickOutsideToClose:true,
			controller:['$scope','site',function($scope,site){
				$scope.site = _this.site;
			}],
			controllerAs:'site',
			locals:{site:_this.site}
        })
        .then(function(reg){
            console.log('_this.registers',_this.site)
            console.log('Reg sent',reg)
            _this.registers.push(reg)
        })

        console.log('openDialog');
    }
    _this.savePos = function(pos){
        var posClass = {tableName : 'gandalf-registers'},
            _registerId = commonLib.createId('register'),
            obj = {
                registerId:_registerId,
                name:pos.name,
                address:pos.address,
                storeId:$stateParams.storeId,
                _id:_registerId
            }
            dbRegisters.put(obj)
            .then(res=>{
                console.log('SUCCESS CREATE REGISTER',res);
                $mdDialog.hide(obj);
            })
            .catch(err=>{
                console.log('ERROR CREATE REGISTER',err);
            });
    }
    _this.addCatalog = function(){
        $mdDialog.show({
            templateUrl: 'components/admin/addCatalog.html',
            parent: angular.element(document.body),
            clickOutsideToClose:true
        })
        console.log('openDialog');
    }
    _this.editSite = function(){
        $mdDialog.show({
            templateUrl: 'components/site/editSite.html',
            parent: angular.element(document.body),
            clickOutsideToClose:true,
			controller:['$scope','site',function($scope,site){
				$scope.site = _this.site;
			}],
			controllerAs:'site',
			locals:{site:_this.site}
        })
        .then(function(obj){
            console.log('answer',obj)
            switch(obj.answer){
                case 'remove':
                    $location.path("/company/"+obj.companyId);
                break;
                case 'contentnotempty':
                    commonLib.showAlert('Caution','Cannot remove Store, registers are not empty');            
                break;
                default:
                    console.log('Returned site',obj.store);
                    _this.store = obj.store;
                break;
            }
        })
        console.log('openDialog');
    }
    _this.removeSite = function(store){
        var _companyId = store.companyId
        dbRegisters.createIndex({fields:['storeId']})
        .then(idx=>{
            dbRegisters.find({selector:{storeId:$stateParams.storeId}})
            .then(res=>{
                if(res.docs.length){
                    $mdDialog.hide({answer:'contentnotempty',companyId:_companyId});
                }else{
                    console.log('HAS NO REGISTERS');
                    dbStores.createIndex({fields:['storeId']})
                    .then(idx=>{
                        dbStores.find({selector:{storeId:$stateParams.storeId}})
                        .then(res=>{
                            var _store = res.docs[0];
                            
                            dbStores.put({
                                _id:_store.storeId,
                                _rev:_store._rev,
                                _deleted:true
                            })
                            .then(res=>{
                                console.log('SUCCESS REMOVE STORE',res);
                                var obj = {answer:'remove',companyId:_companyId}
                                $mdDialog.hide(obj)
                            })
                            .catch(err=>{
                                console.log('FAILED REMOVE STORE',err);
                            });
                        });
                    });
                }
            });
        })
        /*gandalf.listByAsync('gandalf-registers','storeId',$stateParams.storeId)
        .then(function(res){
            if(res.Items.length===0){
                return gandalf.removeAsync({
                    tableName:'gandalf-stores',id:'storeId'
                },{
                    storeId:$stateParams.storeId
                    })
                    .then(function(res){
                        console.log('Success remove store',res)
                        var obj = {answer:'remove',companyId:_companyId}
                        $mdDialog.hide(obj)
                    })
            }else{
                console.log('Cannot remove Store because it has children')
                _this.showAlert('Caution','Cannot remove Store, registers are not empty')
            }
        })
        .catch(function(err){
            console.log('Error listby gandalf-registers')
        })*/
    }
    
    /*_this.showAlert = function(title,content) {
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
    }*/
}
