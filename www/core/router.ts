/// <reference path="../../typings/tsd.d.ts" />

require('angular-ui-router');

routerConfig.$inject = ['$stateProvider', '$urlRouterProvider'];

export default function routerConfig($stateProvider, $urlRouterProvider) {
    // redirect any unmatched url to /home
    $urlRouterProvider.otherwise('/dashboard');

    // states
    $stateProvider
	.state('catalog', {
	    url: '/catalog/:registerId',
	    templateUrl: 'components/catalog/catalog.html',
	    controller: 'CatalogController as catalog'
	})
		.state('cart', {
			url: '/cart/:registerId',
			templateUrl: 'components/catalog/cart.html',
			controller: 'CatalogController as catalog'
		})
	.state('admin', {
	    url: '/admin',
	    template: require('../components/admin/admin.html'),
	    controller: 'AdminController as admin'
	})
	.state('company', {
	    url: '/company/:companyId',
	    template: require('../components/company/company.html'),
	    controller: 'CompanyController as company'
	})
	.state('site', {
	    url: '/site/:storeId',
	    template: require('../components/site/site.html'),
	    controller: 'SiteController as site'
	})
	.state('pos', {
	    url: '/pos/:registerId',
	    template: require('../components/pos/pos.html'),
	    controller: 'PosController as pos'
	})

	.state('product', {
	    url: '/product/:catalogId',
	    template: require('../components/product/product.html'),
	    controller: 'ProductController as product'
	})
	.state('printReceipt', {
	    url: '/printReceipt/:orderId',
	    template: require('../components/receipt/printReceipt.html'),
	    controller: 'ReceiptController as receipt'
	})
	.state('register', {
	    url: '/register',
	    template: require('../components/register/register.html'),
	})
	.state('dashboard', {
	    url: '/dashboard',
	    template: require('../components/dashboard/dashboard.html'),
	    controller: 'DashboardController as dashboard'
	})
	.state('choosePos', {
	    url: '/choosePos',
	    template: require('../components/choosePos/choosePos.html'),
	    controller: 'ChoosePosController as choosePos'
	})
}
