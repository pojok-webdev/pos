const gandalf = require('gandalf-crud');
export default angular.module('app.pos', ['ngMaterial'])
    .controller('PosController', PosController)
    .name


PosController.$inject = ['$mdDialog', '$scope','$stateParams','$location'];
function PosController($mdDialog,$scope,$stateParams,$location) {
    var _this = this;
    gandalf.readAsync({tableName:'gandalf-registers',id:'registerId'},{registerId:$stateParams.registerId})
    .then(function(res){
        console.log("Result of registers before",res.Item)
        _this.register = res.Item
        $scope.$apply()
        gandalf.listByAsync('gandalf-registers','storeId',res.Item.storeId)
        .then(function(registers){
            console.log('result of registers while',registers)
            $scope.registers = registers.Items
            $scope.$apply()
        })
        console.log("Result of registers after",res.Item)
        return res
    })
    .then(function(res){
        if(res.Item.catalogId){
            var catalogId = res.Item.catalogId.toString()
            gandalf.readAsync({tableName:'gandalf-catalogs',id:'catalogId'},{catalogId:catalogId})
            .then(function(catalog){
                _this.catalog = catalog.Item
                console.log('get Catalog success',_this.catalog)
                $scope.$apply()
            })
            .catch(function(err){
                console.log('get catalog error',err)
            })
        }
        return res
    })
    .then(function(res){
        return gandalf.readAsync({tableName:'gandalf-stores',id:'storeId'},{storeId:res.Item.storeId})
        .then(function(store){
            console.log('result of store',store)
            $scope.store = store.Item;
            $scope.$apply()
            return store.Item
        })
        .catch(function(err){
            console.log('Error read store',err)
        })
    })
    .then(function(store){
        gandalf.listByAsync('gandalf-stores','companyId',store.companyId)
        .then(function(stores){
            $scope.stores = stores.Items
            $scope.$apply()
        })
        return store
    })
    .then(function(store){
        return gandalf.readAsync({tableName:'gandalf-companies',id:'companyId'},{companyId:store.companyId})
        .then(function(company){
            $scope.company = company.Item
            $scope.$apply()
        })
    })
    gandalf.listAsync({tableName:'gandalf-companies',id:'companyId'})
    .then(function(companies){
        $scope.companies = companies.Items
        $scope.$apply()
        console.log('companies',companies.Items)
    })
    
    gandalf.listAsync({tableName:'gandalf-catalogs',id:'catalogId'})
    .then(function(res){
        console.log('Items',res.Items)
        _this.catalogs = res.Items
        $scope.$apply()
    })
    .catch(function(err){
        console.log('Error listby',err)
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
        console.log('THIS CATALOG',_this.catalog)
        $mdDialog.show({
            templateUrl: 'components/pos/editPos.html',
            parent: angular.element(document.body),
            clickOutsideToClose:true,
			controller:['$scope','register','catalog',function($scope,register,catalog){
				$scope.register = _this.register;
                console.log('THISCATALOG',_this.catalog)
                $scope.catalog = _this.catalog
                console.log('SCOPECATALOG',$scope.catalog)
			}],
			controllerAs:'pos',
			locals:{register:_this.register,catalog:_this.catalog}
        })
        .then(function(data){
            console.log('DATA OBJ',data.register)
            var _storeId = data.register.storeId
            switch(data.answer){
                case 'remove':
                    gandalf.removeAsync({
                        tableName:'gandalf-registers',id:'registerId'
                    },{
                        registerId:$stateParams.registerId
                    })
                    .then(function(res){
                        console.log('DATA OBJ',data.obj)
                        $location.path("/site/"+_storeId);
                        $scope.$apply()
                    })
                    .catch(function(err){
                        console.log('Err remove pos',err)
                    })
                break;
                case 'update':
                    console.log('REsult of update reg',data)
                    _this.register = data.register
                    _this.catalog = data.catalog
                    console.log('catalog',data.catalog)
                break;
            }
        })
        console.log('openDialog');
    }
    _this.removePos = function(register){
        console.log('register',register)
        var data = {answer:'remove',register:register}
        $mdDialog.hide(data)
    }
    _this.update = function(register,catalog){
        console.log('REgistter',register)
        console.log('CATALOG',register)
        gandalf.updateAsync({
            tableName:'gandalf-registers',id:'registerId'
        },{
            registerId:$stateParams.registerId,
            name:register.name,
            address:register.address,
            storeId:register.storeId,
            catalogId:catalog.catalogId
        })
        .then(function(res){
            _this.register = register
            $scope.$apply()
            console.log('REGISTER',register)
            var _catalogId = catalog.catalogId.toString()
            return gandalf.readAsync({
                tableName:'gandalf-catalogs',
                id:'catalogId'
            },{
                catalogId : _catalogId
            })
            .then(function(catalog){
                var obj = {
                    answer:'update',
                    catalog:catalog.Item,
                    register:register
                }
            $mdDialog.hide(obj)
            })
        })
        .catch(function(err){
            console.log('error update register',err)
        })
    }
    
    gandalf.listAsync({tableName:'gandalf-catalogs',id:'catalogId'})
    .then(function(res){
        _this.catalogs = res.Items
        $scope.$apply()
    })
}