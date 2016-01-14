/// <reference path="../../../typings/tsd.d.ts" />
/// <reference path="./product.d.ts" />

//const gandalf = require('gandalf-crud');
//const gUpload = require('gandalf-upload');
const mime =require('mime');
const pouchdb = require('pouchdb');
pouchdb.plugin(require('pouchdb-find'));
pouchdb.plugin(require('pouchdb-upsert'));

var AWS = (typeof window !== 'undefined') ? window.AWS : require('aws-sdk');

export default angular.module('app.product', ['ngMaterial'])
    .controller('ProductController', ProductController)
    .name


ProductController.$inject = ['$mdDialog', '$scope','$stateParams','sampleData','commonLib'];
function ProductController($mdDialog,$scope,$stateParams,sampleData,commonLib) {
    var _this = this;
    var dbCompanies = new pouchdb('companies');
    var dbCatalogs = new pouchdb('catalogs');
    var dbProducts = new pouchdb('products');

    dbCompanies.allDocs({include_docs:true})
    .then(res=>{
        var _companies = [];
        res.rows.forEach(row=>{
            _companies.push(row.doc);
        });
        _this.companies = _companies;
        $scope.$apply();
    });

    dbCatalogs.allDocs({include_docs:true})
    .then(res=>{
        var _catalogs = [];
        res.rows.forEach(row=>{
            _catalogs.push(row.doc);
        });
        _this.catalogs = _catalogs;
        $scope.$apply();
    });

    dbCatalogs.createIndex({fields:['catalogId']})
    .then(idx=>{
        dbCatalogs.find({selector:{catalogId:$stateParams.catalogId}})
        .then(res=>{
            console.log('CATALOG',res);
            _this.catalog = res.docs[0];//_catalog;
            console.log('THIS CATALOG',_this.catalog);
        });        
    });

    dbProducts.createIndex({
        fields:['catalogId']
    })
    .then(idx=>{
        dbProducts.find({
            selector:{catalogId:$stateParams.catalogId}
        })
        .then(res=>{
            var _products = [];
            res.docs.forEach(doc=>{
                _products.push(doc);
                console.log('PRODUCT',doc);
            })
            _this.products = _products;
            $scope.$apply();
        });
    });

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
                var _product = data.obj.product;
                console.log('PRODUCT',_product);
                dbProducts.put(_product)
                .then(res=>{
                    console.log('UPDATE RESULT',res);
                })
                .catch(err=>{
                    console.log('ERROR update',err);
                });
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
            console.log('IMAGE',obj.image);
            console.log('new Product',obj.product)
            _this.products.push(obj.product)
        })
        .catch(function(err){
            console.log('Error add product',err)
        })
    }

    _this.saveProduct = function(product,categories,image,dataUrl){
        console.log('DATAURL',dataUrl)
        console.log('IMAGE',image)
        var menuNames =' '
        for(var i=0;i<categories.length;i++){
            console.log('category',categories[i])
            menuNames += categories[i] + " "
        }
        var productId = commonLib.createId('product'),
            _product = product;
            _product.imageUrl = 'https://s3.amazonaws.com/com.bagubagu.gandalf/'+productId+'.jpg'
            _product.productId = productId
            _product.catalogId = $stateParams.catalogId
            _product.categoryNames = categories
            _product.menuNames = menuNames
            console.log('category nmase',product.categoryNames)
            console.log('Prodcut to save',_product)
        dbProducts.put({
            _id:productId,
            productId:productId,
            imageUrl:dataUrl,
            catalogId:_product.catalogId,
            categoryNames:_product.categoryNames,       
            productName:_product.productName,
            sellPrice:_product.sellPrice
        })
		.then(function(res){
			console.log('SUCCESS CREATE ITEM',res);
            var obj = {
                product:_product,
                image:dataUrl
            }
            $mdDialog.hide(obj);
		})
		.catch(function(err){
			console.log('ERROR CREATE ITEM',err);
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
        dbCatalogs.createIndex({fields:['catalogId']})
        .then(idx=>{
            dbCatalogs.find({selector:{catalogId:$stateParams.catalogId}})
            .then(res=>{
                var _catalog = res.docs[0]
                dbCatalogs.put({
                    _id:catalog.catalogId,
                    catalogId:catalog.catalogId,
                    _rev:_catalog._rev,
                    name:catalog.name
                })
                .then(res=>{
                    console.log('SUKSE UPDATE CATALOG',res);
                    $mdDialog.hide({catalogId:$stateParams.catalogId,name:catalog.name});
                })
                .catch(err=>{
                    console.log('ERRO UPDATE CATALOG',err);
                });
            })
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
        dbProducts.createIndex({
            fields:['productId']
        })
        .then(idx=>{
            dbProducts.find({
                selector:{productId:product.productId}
            })
            .then(res=>{
                dbProducts.remove(res.docs[0])
                .then(removed=>{
                    console.log('SUCCESS REMOVE',removed)
                })
                .catch(err=>{
                    console.log('SUCCESS REMOVE',err)
                });
            })
        });
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
}
