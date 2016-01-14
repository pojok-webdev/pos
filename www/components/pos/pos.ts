const gandalf = require('gandalf-crud');
const pouchdb = require('pouchdb');
pouchdb.plugin(require('pouchdb-find'));
pouchdb.plugin(require('pouchdb-upsert'));
export default angular.module('app.pos', ['ngMaterial'])
    .controller('PosController', PosController)
    .name


PosController.$inject = ['$mdDialog', '$scope','$stateParams','$location'];
function PosController($mdDialog,$scope,$stateParams,$location) {
    var _this = this;
    var dbRegisters = new pouchdb('registers');
    var dbStores = new pouchdb('stores');
    var dbCompanies = new pouchdb('companies');
    var dbCatalogs = new pouchdb('catalogs');
    var dbUserProfile = pouchdb('userProfile');
    
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
                    })
                    _this.companies = _companies;
                    $scope.$apply();
                });
            });
        });
    });
    dbRegisters.createIndex({fields:['registerId']})
    .then(idx=>{
        dbRegisters.find({selector:{registerId:$stateParams.registerId}})
        .then(res=>{
            console.log('CUR REGISTER',res.docs[0]);
            _this.register = res.docs[0];
            $scope.$apply();
            dbRegisters.createIndex({fields:['storeId']})
            .then(idx=>{
                dbRegisters.find({selector:{storeId:_this.register.storeId}})
                .then(res=>{
                    var _registers = [];
                    res.docs.forEach(doc=>{
                        _registers.push(doc);
                    });
                    _this.registers = _registers;
                    $scope.$apply();
                    dbStores.createIndex({fields:['storeId']})
                    .then(idx=>{
                        dbStores.find({selector:{storeId:_this.register.storeId}})
                        .then(res=>{
                            _this.store = res.docs[0];
                            console.log('STORE',res);
                            $scope.$apply();
                            return (_this.store);
                        })
                        .then(res=>{
                            dbStores.createIndex({fields:['companyId']})
                            .then(idx=>{
                                dbStores.find({selector:{companyId:_this.store.companyId}})
                                .then(res=>{
                                    var _stores = [];
                                    res.docs.forEach(doc=>{
                                        _stores.push(doc);
                                    });
                                    _this.stores = _stores;
                                    $scope.$apply();
                                    return res;
                                })
                                .then(res=>{
                                    dbCompanies.createIndex({fields:['companyId']})
                                    .then(idx=>{
                                        dbCompanies.find({selector:{companyId:_this.store.companyId}})
                                        .then(res=>{
                                            _this.company = res.docs[0];
                                            $scope.$apply();
                                            return _this.company;
                                        })
                                        .then(res=>{
                                            dbCompanies.createIndex({fields:['userId']});
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        })
    })
    
    console.log('Register Id',$stateParams.registerId)
    _this.addCompany = function(){
        $mdDialog.show({
            templateUrl: 'components/admin/addCompany.html',
            parent: angular.element(document.body),
            clickOutsideToClose:true
        })
        console.log('openDialog');
    }
    _this.addsite = function(){
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
            clickOutsideToClose:true
        })
        console.log('openDialog');
    }
    _this.editPos = function(){
        console.log('THIS REGISTER',_this.register)
        $mdDialog.show({
            templateUrl: 'components/pos/editPos.html',
            parent: angular.element(document.body),
            clickOutsideToClose:true,
			controller:['$scope','register','catalog',function($scope,register,catalog){
				$scope.register = _this.register;
                $scope.catalog = _this.register.catalog;
                this.catalogs = _this.catalogs;
                this.update = function(register,catalog){
                    dbRegisters.createIndex({fields:['_id']})
                    .then(idx=>{
                        dbRegisters.find({selector:{_id:register._id}})
                        .then(res=>{
                            var _register = res.docs[0];
                            register.catalog = catalog;
                            register._rev = _register._rev;
                            dbRegisters.put(register)
                            .then(res=>{
                                $mdDialog.hide({answer:'update',register:register});
                            })
                            .catch(err=>{
                                console.log('ERROR UPDATE REG',err);
                            });
                        });
                    })
                }
			}],
			controllerAs:'pos',
			locals:{register:_this.register,catalog:_this.register.catalog}
        })
        .then(function(data){
            console.log('DATA OBJ',data.register)
            var _storeId = data.register.storeId
            switch(data.answer){
                case 'remove':
                break;
                case 'update':
                    console.log('REsult of update reg',data)
                    _this.register = data.register
                    _this.catalog = data.register.catalog
                    console.log('catalog',data.register.catalog)
                break;
            }
        })
        console.log('openDialog');
    }
    _this.removePos = function(register){
        register.deleted = true;
        dbRegisters.put(register)
        .then(res=>{
            console.log('success remove register',register)
            var data = {answer:'remove',register:register}
            $mdDialog.hide(data);
        });
    }
    dbCatalogs.allDocs({include_docs:true})
    .then(res=>{
        var _catalogs = [];
        res.rows.forEach(row=>{
            _catalogs.push(row.doc);
        })
        _this.catalogs = _catalogs;
        $scope.$apply();
    });

}