/// <reference path="../../../typings/tsd.d.ts" />
var gandalf = require('gandalf-crud'), objProduct = { tableName: 'gandalf-products' };

// const CatalogController = require('./Catalog.controller.ts');

export default angular.module('app.catalog', [])
    .controller('CatalogController', CatalogController)
    .name

CatalogController.$inject = ['$mdSidenav', '$mdDialog', '$scope', '$location', '$stateParams'];

function CatalogController($mdSidenav, $mdDialog, $scope, $location,$stateParams) {
    var _this = this, order = {}, orders = [], selectedItem;

	gandalf.readAsync({tableName:'gandalf-registers',id:'registerId'},{registerId:$stateParams.registerId})
	.then(function(res){
		_this.register = res.Item
		var _storeId = res.Item.storeId
		console.log('gandalf-register',res.Item)
			var _catalogId = res.Item.catalogId.toString()
			console.log('_catalogId',_catalogId)
			$scope.$apply()
			gandalf.listByAsync('gandalf-products','catalogId',_catalogId)
			.then(function(catRes){
				_this.data = catRes
				console.log('catRes',catRes)
				$scope.$apply()
			})

		return 	gandalf.readAsync({tableName:'gandalf-stores',id:'storeId'},{storeId:_storeId})
		.then(function(res){
			_this.store = res.Item
			console.log('res.item',res.Item)
		})

	})
	_this.total = 'Rp. 0,-';
    _this.customSale = function() {
        $mdDialog.show({
            templateUrl: 'components/catalog/custom-sale.html',
            parent: angular.element(document.body),
            clickOutsideToClose: true,
			controller: ['$scope', 'quantity', function($scope, quantity) {
				$scope.quantity = 1
				$scope.addQty = function() {
					$scope.quantity += 1
				}
				$scope.redQty = function() {
					if ($scope.quantity > 0) {
						$scope.quantity -= 1
					}
				}
			}],
			controllerAs: 'catalog',
			locals: { quantity: 1 }
        })
			.then(function(_orders) {
				_this.addToCart(_orders)
			})
        console.log('openDialog');
    }

	_this.qty = function(i) {
		_this.quantity = i.qty
		console.log('Qty', i.qty)
		$mdDialog.show({
			templateUrl: 'components/catalog/qty.html',
			parent: angular.element(document.body),
			clickOutsideToClose: true,
			controller: ['$scope', 'purchasedItem', 'quantity', function($scope, purchasedItem, quantity) {
				$scope.purchasedItem = i
				$scope.quantity = i.qty
				$scope.addQty = function() {
					$scope.quantity += 1
				}
				$scope.reduceQty = function() {
					if ($scope.quantity > 0) {
						$scope.quantity -= 1
					}
				}
			}],
			controllerAs: 'catalog',
			locals: { purchasedItem: i, quantity: i.qty }
		})
			.then(function(item) {
				var _total = 0;
				console.log('Item', item)
				i.qty = item.qty
				i.subTotal = item.qty * i.sellPrice
				console.log('IQty', i.qty)
				console.log('ISubtotal', i.subTotal)
				console.log('this order', _this.order)
				console.log('Orders', _this.order.orders)
				for (var c = 0; c < _this.order.orders.length; c++) {
					_total *= 1
					_total += _this.order.orders[c].subTotal
					_this.order.total = _total;
					console.log('subTotal', _this.order.orders[c].subTotal)
					console.log('total', _this.order.total = _total)
				}
				if (item.qty === 0) {
					var index = orders.indexOf(i);
					_this.orders.splice(index, 1);
					_this.order.orders = _this.orders
				}
			})
		console.log('openDialog', i);
	}

	_this.changeQty = function(purchasedItem, qty) {
		var _orders = {
			productId: purchasedItem.productId,
			sellPrice: purchasedItem.sellPrice,
			subTotal: purchasedItem.sellPrice * qty,
			qty: qty
		};
		$mdDialog.hide(_orders)
		console.log('Orders', _orders)
	}

	_this.checkOut = function(order) {
		console.log('orders received', order);
		$mdDialog.show({
			templateUrl: 'components/catalog/checkout.html',
			parent: angular.element(document.body),
			clickOutsideToClose: true,
			controller: ['$scope', 'order', function($scope, order) {
				$scope.order = order
				$scope.custCash = '0'
				$scope.updateCash = function(num) {
					console.log('Num', num)
					if ($scope.custCash === '0') {
						switch (num) {
							case '00':
								$scope.custCash = '0'
								break;
							case 'del':
								$scope.custCash = '0'
								break;
							default:
								$scope.custCash = num
								break;
						}
					} else {
						switch (num) {
							case '10000':
								$scope.custCash = num
								break;
							case '20000':
								$scope.custCash = num
								break;
							case '50000':
								$scope.custCash = num
								break;
							case '100000':
								$scope.custCash = num
								break;
							case 'del':
								if ($scope.custCash.length > 1) {
									$scope.custCash = $scope.custCash.substr(0, $scope.custCash.length - 1)
								} else {
									$scope.custCash = '0'
								}
								break;
							default:
								$scope.custCash += num;
								break;
						}
					}
				}
			}],
			locals: { order: order }
		})
		console.log('openDialog');
	}
	_this.printDialog = function(evt) {
		console.log('cash', $scope.custCash, $scope.order);
		_this.custCash = $scope.custCash;
		_this.order = $scope.order;
		_this.order.dateTime = _this.getCurrentDateTime();
		_this.order.orderId = _this.createId();
		_this.order.custCash = $scope.custCash;
		_this.order.change = $scope.custCash - _this.order.total;
		$scope.dialogOpen = true;
		$mdDialog.show({
			templateUrl: 'components/catalog/print.html',
			parent: angular.element(document.body),
			targetEvent: evt,
			clickOutsideToClose: true,
			controller: ['$scope', 'custCash', 'order', 'change', function($scope, custCash, order, change) {
				$scope.custCash = _this.custCash;
				$scope.order = _this.order;
				$scope.change = _this.custCash - _this.order.total;
			}],
			controllerAs: 'catalog',
			locals: { custCash: 'beb', order: _this.order, change: 0 }
		})
		console.log('openDialog', order);
	}
    _this.addToCart = function(i) {
		console.log('Add to cart invoked')
		var c = 0,
			_orders = {
				name: i.productName,
				imageUrl: i.imageUrl,
				productId: i.productId,
				sellPrice: i.sellPrice,
				subTotal: i.sellPrice,
				qty: 1
			}, ordersFound = false, _total = 0;
		if (orders.length) {
			for (var ii = 0; ii < orders.length; ii++) {
				if (orders[ii].productId === _orders.productId) {
					ordersFound = true;
					orders[ii].qty += 1;
					orders[ii].subTotal = parseInt(_orders.subTotal) * parseInt(orders[ii].qty);
				}
				_total += parseInt(orders[ii].subTotal);
			}
			if (!ordersFound) {
				console.log('_orders.sellPrice', _orders.sellPrice);
				console.log('_total', _total);
				orders.push(_orders);
				_total += parseInt(_orders.sellPrice);
				console.log('_total', _total);
			}
		} else {
			_total += parseInt(_orders.sellPrice);
			orders.push(_orders);
		}
		console.log('orders', orders);
		_this.orders = orders
		_this.total = _total;
		_this.order = { orders: orders, total: _total }
		console.log('should be updated')
    }

	_this.removeOrderItem = function(i) {
		var sellPrice = i.subTotal / i.qty;
		if (i.qty > 1) {
			i.qty -= 1;
			i.subTotal = sellPrice * i.qty;
			console.log('I.Qty', i.qty);
		} else {
			var index = orders.indexOf(i);
			orders.splice(index, 1);
		}
		_this.order.total -= sellPrice;
	}

	_this.saveOrder = function(order) {
		console.log('new Date',new Date())
		order.orderId = order.orderId;
		order.userId = 'u123';
		order.registerId = $stateParams.registerId;
		order.storeId = _this.register.storeId;
		order.companyId = _this.store.companyId;
		order.timestamp = new Date();
		var objClass = { tableName: 'gandalf-orders', id: 'orderId' },
			obj = order;
		gandalf.createAsync(objClass, obj)
			.then(function(res) {
				$mdDialog.hide();
//				$location.path('/printReceipt/'+order.orderId);
				$location.path("/printReceipt/"+order.orderId);
				//window.location.href = '/#/printReceipt/' + order.orderId
			})
			.catch(function(err) {
				console.log('Error save Order', err)
			});
	}

	_this.saveCustomSale = function(customSale, qty) {
		console.log('save custom sale invoked', customSale)
		var _orders = {
			productName: customSale.productName,
			imageUrl: './components/product/img/no-product-50px.jpg',
			productId: 'customSale',
			sellPrice: customSale.sellPrice,
			subTotal: customSale.sellPrice,
			qty: qty
		}
		$mdDialog.hide(_orders)
		console.log('Orders', _orders)
	}
	_this.getCurrentDateTime = function() {
		var curdt = new Date(),
			dt = curdt.getDate(),
			mt = curdt.getMonth()+1,
			yr = curdt.getFullYear(),
			hr = curdt.getHours(),
			mn = curdt.getMinutes(),
			sc = curdt.getSeconds();
//		return dt + '/' + mt + '/' + yr + ' ' + hr + ':' + mn + ':' + sc;
		return yr + '-' + mt + '-' + dt + ' ' + hr + ':' + mn + ':' + sc; 
	}

	_this.createId = function() {
		var curdt = new Date(),
			dt = curdt.getDate(),
			mt = curdt.getMonth(),
			yr = curdt.getFullYear(),
			hr = curdt.getHours(),
			mn = curdt.getMinutes(),
			sc = curdt.getSeconds();
		return 'o' + dt + mt + yr + hr + mn + sc;
	}


}
