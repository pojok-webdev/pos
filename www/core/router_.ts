/// <reference path="../../typings/tsd.d.ts" />

require('angular-ui-router');

routerConfig.$inject = ['$stateProvider', '$urlRouterProvider'];

export default function routerConfig($stateProvider, $urlRouterProvider) {
    // redirect any unmatched url to /home
    $urlRouterProvider.otherwise('/home');

    // states
    $stateProvider
	.state('home', {
	    url: '/home',
	    template: require('../components/home/home.html'),
	    controller: 'HomeController as home',
	})
	.state('page2', {
	    url: '/page2',
	    template: require('../components/page2/page2.html'),
	    controller: 'Page2Controller as page2',
	})
	.state('users', {
		url: '/users',
		template: require('../components/users/users.html'),
		controller: 'UsersController as users',
		resolve: {
			userId: ['$stateParams', function($stateParams) {
				return $stateParams.userId;
			}]
		}
	})
	.state('usersDetail', {
		url: '/users/{userId}',
		template: require('../components/users/users.detail.html'),
		controller: 'UsersDetailController as usersDetail',
	})
	/*.state('aws', {
	    url: '/aws',
	    template: require('../components/aws/aws.html'),
	    controller: 'AwsController as aws',
	})*/
	.state('auth0', {
	    url: '/auth0',
	    template: require('../components/auth0/auth0.html'),
	    controller: 'Auth0Controller as auth0',
	});
}
