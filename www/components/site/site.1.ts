const gandalf = require('gandalf-crud');
export default angular.module('app.site', ['ngMaterial'])
    .controller('SiteController', SiteController)
    .name
SiteController.$inject = ['$mdDialog', '$scope','$stateParams','$location'];
function SiteController($mdDialog,$scope,$stateParams,$location) {
    var _this = this;
        
    gandalf.listAsync({tableName:'gandalf-companies',id:'companyId'})
    .then(function(res){
        $scope.$apply(_this.companies = res.Items);
        console.log('Companies',res)
    })
    .catch(function(err){
        console.log('Error get Companies',err)
    })
    gandalf.readAsync({tableName:'gandalf-stores',id:'storeId'},{storeId:$stateParams.storeId})
    .then(function(res){
        _this.site = res.Item
        console.log('Store',res.Item)
        gandalf.readAsync({tableName:'gandalf-companies',id:'companyId'},{companyId:res.Item.companyId})
        .then(function(company){
            $scope.$apply(_this.company = company.Item)
            return company;
        })
        .then(function(company){
            console.log('companyId',company)
            return gandalf.listByAsync('gandalf-stores','companyId',company.Item.companyId)
            .then(function(stores){
                $scope.$apply(_this.stores = stores.Items)
            })
        })
        .catch(function(err){
            console.log('Error get Company',err)
        })
        return res;
    })
    .then(function(res){
        _this.store = res.Item
        $scope.$apply(_this.store = res.Item);
        return gandalf.listByAsync('gandalf-registers','storeId',$stateParams.storeId)
        .then(function(res){
            console.log(res.Items)
            $scope.$apply(_this.registers = res.Items);
        })
        .catch(function(err){
            console.log('Error list Registers',err)
        });
        console.log('store',res.Item)
    });
    
    gandalf.listAsync({tableName:'gandalf-catalogs',id:'catalogId'})
    .then(function(res){
        console.log('Items',res.Items)
        _this.catalogs = res.Items
        $scope.$apply()
    })
    .catch(function(err){
        console.log('Error listby',err)
    })
    
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
        .then(function(site){
            
        })
        console.log('openDialog');
    }
    _this.updateSite = function(store){
        var _obj = store;
        _obj.storeId = $stateParams.storeId;
        gandalf.updateAsync({tableName:'gandalf-stores',id:'storeId'},_obj)
        .then(function(res){
            console.log('Success update Store',res)
            var obj = {store:_obj,answer:'update'}
            $mdDialog.hide(obj);
        })
        .catch(function(err){
            console.log('Error update Store',err)
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
            obj = {
                registerId:_this.createId('register'),
                name:pos.name,
                address:pos.address,
                storeId:$stateParams.storeId
            }
        gandalf.createAsync(posClass,obj)
        .then(function(res){
            console.log('Success create Register',res)
            $mdDialog.hide(obj)
        })
        .catch(function(err){
            console.log('Error save Register',err)
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
            if(obj.answer === 'remove'){
                $location.path("/company/"+obj.companyId);
            }else{
                console.log('Returned site',obj.store)
                _this.store = obj.store
            }
        })
        console.log('openDialog');
    }
    _this.removeSite = function(store){
        var _companyId = store.companyId
        gandalf.listByAsync('gandalf-registers','storeId',$stateParams.storeId)
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
        })
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
