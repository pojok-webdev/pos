const gandalf = require('gandalf-crud');
export default angular.module('app.company', ['ngMaterial'])
    .controller('CompanyController', CompanyController)
    .name


CompanyController.$inject = ['$mdDialog', '$scope','$stateParams','$location','commonLib'];
function CompanyController($mdDialog,$scope,$stateParams,$location,commonLib) {
    var _this = this;
    console.log('companyId',$stateParams.companyId)
    
    gandalf.listAsync({tableName:'gandalf-companies',id:'companyId'})
    .then(function(res){
		$scope.$apply(_this.companies = res.Items);
    }).catch(function(err){
		console.log(err);
    });

    gandalf.readAsync({
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
            clickOutsideToClose:true,
			controller:['$scope','company',function($scope,company){
				$scope.company = _this.company;
			}],
			controllerAs:'company',
			locals:{company:_this.company}
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
        console.log('store to save',store,_this.company.companyId)
        objsite.companyId = _this.company.companyId;
        objsite.storeId = commonLib.createId('store')
        gandalf.createAsync({tableName:'gandalf-stores',id:'storeId'},objsite)
        .then(function(res){
            console.log('Save Site uccess',res)
            $mdDialog.hide(objsite);
        })
        .catch(function(err){
            console.log('Error save Site',err)
        });
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
        .then(function(cmp){
            console.log('Res of Dialog',cmp)
            _this.company=cmp
        })
        console.log('company to edit',_this.company)
    }
    _this.update = function(company){
        console.log('Update Company',company)
        gandalf.updateAsync({
            tableName:'gandalf-companies',id:'companyId'
        },company)
        .then(function(res){
            $scope.$apply(_this.company = company);
            console.log('Update success',_this.company);
            $mdDialog.hide(company)
        })
        .catch(function(err){
            console.log('Update Error',err);
        });
    }
	
    _this.remove = function(company){
        gandalf.listByAsync('gandalf-stores','companyId',$stateParams.companyId)
        .then(function(res){
            console.log('result stores',res.Items)
            if(res.Items.length===0){
                return gandalf.removeAsync({
                    tableName:'gandalf-companies',id:'companyId'
                    }, {
                        companyId:$stateParams.companyId
                    })
                    .then(function(res){
                        console.log('success remove company',res)
                        $mdDialog.hide()
                        $location.path("/admin");
                    })
                    .catch(function(err){
                        console.log('error remove company',err)
                    })
            }
            else
            {
                console.log('Cannot remove because has children',res.Items.length)
                _this.showAlert('Caution','Cannot remove company, sites are not empty')
                return;
            }
        })
        .catch(function(err){
            console.log('Error list by gandalf-stores')
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
    
	/*_this.createId = function(obj){
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
	}*/
}