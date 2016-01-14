/// <reference path="../../../typings/tsd.d.ts" />
/// <reference path="./product.d.ts" />

const gandalf = require('gandalf-crud');
const gUpload = require('gandalf-upload');
const mime =require('mime')

var AWS = (typeof window !== 'undefined') ? window.AWS : require('aws-sdk');

export default angular.module('app.product', ['ngMaterial'])
    .controller('ProductController', ProductController)
    .name


ProductController.$inject = ['$mdDialog', '$scope','$stateParams'];
function ProductController($mdDialog,$scope,$stateParams) {
    var _this = this;
    gandalf.listAsync({tableName:'gandalf-companies',id:'companyId'})
    .then(function(res){
        _this.companies = res.Items
        $scope.$apply()
    })
    gandalf.listAsync({tableName:'gandalf-catalogs',id:'catalogId'})
    .then(function(res){
        $scope.$apply(_this.catalogs = res.Items)
    })
    gandalf.readAsync({tableName:'gandalf-catalogs',id:'catalogId'},{catalogId:$stateParams.catalogId})
    .then(function(res){
        $scope.$apply(_this.catalog = res.Item)
    })
    gandalf.listByAsync('gandalf-products','catalogId',$stateParams.catalogId)
    .then(function(res){
        console.log('Items',res.Items)
        $scope.$apply(_this.products = res.Items)
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
            clickOutsideToClose:true,
			controllerAs:'prod',
			locals:{product:_this.product}
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
    _this.editProduct = function(product){
        $mdDialog.show({
            templateUrl: 'components/product/editProduct.html',
            parent: angular.element(document.body),
            clickOutsideToClose:true,
			controller:['$scope','product','productImage','categories','tets',function($scope,product,productImage,categories,tets){
				$scope.product = product;
                $scope.categories = []
                for(var i=0; i < product.categoryNames.length;i++){
                    $scope.categories.push(product.categoryNames[i])
                    console.log('categoryNames',product.categoryNames[i])
                }
                $scope.upload = function(event){
                    console.log('upload invoked bro')
                    var input = event.target;
                    var fileReader = new FileReader();
                    fileReader.onloadend = function () {
                        var uri = fileReader.result;
                        //$scope.productImage = _this.resizeImage(uri);
                        $scope.product.imageUrl = _this.resizeImage(uri);

                    var fr = input.files[0];
                    console.log('FR',fr.type,fr.name)
                    $scope.fr = fr;
                        $scope.$apply();
                        console.log("executed", uri);
                    };
                    fileReader.readAsDataURL(input.files[0]);
                }
                $scope.imageClick = function(){
                    console.log("image has clicked")
                    setTimeout(function () {
                        document.getElementById('file').click();
                    }, 0);
                }
                console.log('SCOPE CATEGORIES',$scope.categories)
                if($scope.categories.indexOf('food')>-1){
                    console.log('food exists')
                    $scope.product.categoryNames.food = 'food';
                }
                if($scope.categories.indexOf('package')>-1){
                    console.log('package exists')
                    $scope.product.categoryNames.package = 'package';
                }
                if($scope.categories.indexOf('drink')>-1){
                    console.log('drink exists')
                    $scope.product.categoryNames.drink = 'drink';
                }
			}],
            controllerAs:'prod',
            locals:{product:product,productImage:_this.productImage,categories:[],tets:true}
        })
        .then(function(data){
            if(data.answer==='update'){
                console.log('DATA',data)
                console.log('Product received',data.obj.product)
                console.log('upload invoked',data.obj.image)
                var image = ''
                if(data.obj.image){
                    console.log('has other image')
                    image = 'https://s3.amazonaws.com/com.bagubagu.gandalf/'+data.obj.product.productId+'.jpg'
                }else{
                    console.log('image not change')
                    image = data.obj.product.imageUrl;
                }
                gandalf.updateAsync({tableName:'gandalf-products',id:'productId'},data.obj.product/*{
                    productId:data.obj.product.productId,
                    catalogId:$stateParams.catalogId,
                    productName:data.obj.product.productName,
                    imageUrl:image,
                    categoryNames:data.obj.product.categoryNames,
                    sellPrice:data.obj.product.sellPrice,
                    barcode:data.obj.product.barcode,
                    tags: data.obj.product.tags,
                    sellTaxCode: data.obj.product.sellTaxCode,
                    costTaxCode: data.obj.product.costTaxCode,
                    costPrice: data.obj.product.costPrice,
                    description: data.obj.product.description,
                }*/)
                .then(function(res){
                    if(data.obj.image){
                        console.log('Image exist')
                        var s3 = new AWS.S3(),
                        data = {
                            Bucket: 'com.bagubagu.gandalf',
                            Key: data.obj.product.productId + '.jpg',
                            Body: data.obj.image,
                            ACL: "public-read",
                            ContentType: data.obj.image.type
                        };
                        s3.putObject(data, function(err, resp) {
                        console.log("upload success");
                        _this.product = data.obj.product
                        });
                    }
                })
                .catch(function(err){
                    console.log('Error create Product',err)
                })
            }else{//remove
                _this.showConfirmation(data.obj)
            }

        })
        console.log('openDialog');
    }

    _this.updateProduct = function(fr,categories,product){
        console.log('fr',fr)
        var _menuNames =' '
        var _categoryNames = [];
        if(product.categoryNames.food==='food'){
            console.log('productCategoryNamesFood invoked')
            _categoryNames.push('food')
             _menuNames += 'food'
        }
        if(product.categoryNames.drink==='drink'){
            console.log('productCategoryNamesDrink invoked')
            _categoryNames.push('drink')
            _menuNames += 'drink'
        }
        if(product.categoryNames.package==='package'){
            console.log('productCategoryNamesPackage invoked')
            _categoryNames.push('package')
            _menuNames += 'package'
        }
        product.categoryNames = _categoryNames
        product.menuNames = _menuNames
        console.log('product.menuNames',product.menuNames)
        console.log('product.menuNames',product.categoryNames)
        var obj = {
            product : product,
            image:fr
        }
        var data = {obj:obj,answer:'update'}
        console.log('Image to be Updated',data.obj.image)
         $mdDialog.hide(data)
    }

    _this.addProduct = function(){
        $mdDialog.show({
            templateUrl: 'components/product/addProduct.html',
            parent: angular.element(document.body),
            clickOutsideToClose:true,
			controller:['$scope','product','productImage','categories',function($scope,product,productImage,categories){
				$scope.product = product;
                $scope.categories = []
                $scope.upload = function(event){
                    console.log('upload invoked bro')
                    var input = event.target;
                    var fileReader = new FileReader();
                    fileReader.onloadend = function () {
                        var uri = fileReader.result;
                        $scope.productImage = _this.resizeImage(uri);
                    var fr = input.files[0];
                    console.log('FR',fr.type,fr.name)
                    $scope.fr = fr;
                        $scope.$apply();
                        console.log("executed", uri);
                    };
                    fileReader.readAsDataURL(input.files[0]);
                }
                $scope.imageClick = function(){
                    setTimeout(function () {
                        document.getElementById('file').click();
                    }, 0);
                }
                $scope.categoryClick = function(category,checked){
                    console.log('category clikced',checked)
                    var found = false,
                        index = $scope.categories.indexOf(category);
                    if(checked!=='nope'){
                        $scope.categories.push(category)
                    }else{
                        $scope.categories.splice(index,1)
                    }
                    console.log('Mycategories',$scope.categories)
                }
			}],
            controllerAs:'prod',
            locals:{product:'',productImage:'',categories:[]}
        })
        .then(function(obj){
            console.log('new Product',obj.product)
            _this.products.push(obj.product)
        })
        .catch(function(err){
            console.log('Error add product',err)
        })
    }

    _this.saveProduct = function(product,categories,image,dataUrl){
        console.log('save dataUrl invoked',dataUrl)
        console.log('save categories invoked',categories)
        var menuNames =' '
        for(var i=0;i<categories.length;i++){
            console.log('category',categories[i])
            menuNames += categories[i] + " "
        }
        var productId = _this.createId('product'),
            _product = product;
            _product.imageUrl = 'https://s3.amazonaws.com/com.bagubagu.gandalf/'+productId+'.jpg'
            _product.productId = productId
            _product.catalogId = $stateParams.catalogId
            _product.categoryNames = categories
            _product.menuNames = menuNames
            console.log('category nmase',product.categoryNames)
            console.log('Prodcut to save',_product)
        gandalf.createAsync({tableName:'gandalf-products',id:'productId'},_product)
        .then(function(res){
            var s3 = new AWS.S3(),
                data = {
                    Bucket: 'com.bagubagu.gandalf',
                    Key: productId+'.jpg',
                    Body: image,
                    ACL: "public-read",
                    ContentType: image.type
                };
                s3.putObject(data, function(err, resp) {
                console.log("upload success");
                });
            var obj = {
                product : _product,
                image: image
            }
            $mdDialog.hide(obj)
        })
    }

    _this.removeProduct = function(product){
        var data = {obj : product, answer : 'remove'}
        $mdDialog.hide(data)
    }

    _this.addCatalog = function(){
        $mdDialog.show({
            templateUrl: 'components/admin/addCatalog.html',
            parent: angular.element(document.body),
            clickOutsideToClose:true
        })
        console.log('openDialog');
    }

    _this.editCatalog = function(){
        console.log('current catalog name',_this.catalog.name)
        $mdDialog.show({
            templateUrl: 'components/product/editCatalog.html',
            parent: angular.element(document.body),
            clickOutsideToClose:true,
            controller:['$scope','catalog',function($scope,catalog){
                $scope.catalog = _this.catalog
            }],
            controllerAs:'product',
            locals:{catalog:_this.catalog}
        })
        .then(function(catalog){
            _this.catalog = catalog
        })
        console.log('openDialog');
    }

    _this.updateCatalog = function(catalog){
        gandalf.updateAsync({
            tableName:'gandalf-catalogs',id:'catalogId'
        },{
            catalogId:$stateParams.catalogId,
            name:catalog.name
        })
        .then(function(res){
            $mdDialog.hide({catalogId:$stateParams.catalogId,name:catalog.name})
        })
        .catch(function(err){
            console.log('Error update Catalog',err)
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

    _this.showConfirmation = function(product) {
    var confirm = $mdDialog.confirm()
          .title('Removal Confirmation')
          .content('Are you sure to delete this item ?')
          .ariaLabel('Lucky day')
          //.targetEvent(ev)
          .ok('Yes')
          .cancel('No');

    $mdDialog.show(confirm)
    .then(function() {
        console.log('OK',product)
        gandalf.removeAsync({tableName:'gandalf-products',id:'productId'},{productId:product.productId})
        .then(function(res){
            var index = _this.products.indexOf(product)
            _this.products.splice(index,1)
            $scope.$apply()
        })
        .catch(function(err){
            console.log('Err remove product',err)
        })
    }, function() {
        console.log('No',product)
    });

    }

    _this.resizeImage = (url) => {
        var canvas = document.createElement("canvas");
        var maxwidthallowed = 200;
        var maxheight = 0;
        canvas.width = 200;
        var img = new Image();
        img.src = url;
        maxheight = img.height * maxwidthallowed/img.width;
        canvas.height = maxheight;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img,0,0,maxwidthallowed,maxheight);
        return canvas.toDataURL("image/jpeg");
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
