/// <reference path="../../../typings/tsd.d.ts" />

require('auth0-angular');

export default angular.module('app.auth0', [
    'auth0',
    require('angular-storage'),
    require('angular-jwt'),
])
    .config(Auth0Config)
    .run(Auth0Run)
    .controller('Auth0Controller', Auth0Controller);

Auth0Run.$inject = ['auth', '$rootScope', 'store', 'jwtHelper', '$location'];

function Auth0Run(auth, $rootScope, store, jwtHelper, $location) {
    auth.hookEvents();

    // To keep user logged in, retrieve token from localStorage on each page refresh

    $rootScope.$on('$locationChangeStart', () => {
	let token = store.get('token');
	if (token) {
	    if (!jwtHelper.isTokenExpired(token)) {
		if (!auth.isAuthenticated) {
		    auth.authenticate(store.get('profile'), token);
		}
	    } else {
		// Either show login page or use the refresh token to get new idToken
		// TODO: write code to use refresh token

		// show login page
		$location.path('/auth0');
	    }
	}
    });
}

Auth0Config.$inject = ['authProvider', '$httpProvider', 'jwtInterceptorProvider'];

function Auth0Config(authProvider, $httpProvider, jwtInterceptorProvider) {
    authProvider.init({
  	domain: 'louislarry.auth0.com',
  	// clientId: 'yrZ74GnnkjNpjKDbWlLPVtMkyTetcwm7',
  	clientID: 'yrZ74GnnkjNpjKDbWlLPVtMkyTetcwm7',
        callbackUrl: location.href,
        loginState: 'auth0',
	// sso: true,
    });

    jwtInterceptorProvider.tokenGetter = ['store', function(store) {
	return store.get('token');
    }];

    $httpProvider.interceptors.push('jwtInterceptor');

    authProvider.on('authenticated', ['$location', function($location) {
	console.log('on authenticated');
    }]);

    authProvider.on('loginSuccess',
		    ['profilePromise', 'idToken', '$location', 'store',
		     function(profilePromise, idToken, $location, store) {
			 console.log('on loginSuccess');
			 profilePromise.then( profile => {
			     store.set('profile', profile);
			     store.set('token', idToken);
			 });
			 $location.path('/');
		     }]);

    authProvider.on('loginFailure', ['error', '$location', function (error, $location) {
	console.log('loginFailure');
	$location.path('/error');
    }]);

    authProvider.on('logout', ['store', function(store) {
	console.log('on logout');
	store.remove('profile');
	store.remove('idToken');

    }]);

    authProvider.on('forbidden', () => {
	console.log('on forbidden');
    });
}

successCb.$inject = ['profilePromise', 'idToken', '$location', 'store'];
function successCb (profilePromise, idToken, $location, store) {
    console.log('successCb');
}

errorCb.$inject = ['err', '$location'];
function errorCb (err, $location) {
    console.log('errorCb');
}

Auth0Controller.$inject = ['$http', 'auth', 'store', '$location'];

function Auth0Controller($http, auth, store, $location) {
    this.profile = auth.profile;
    this.isAuthenticated = auth.isAuthenticated;

    this.login = () => {
	auth.signin({ popup: true }, successCb, errorCb);
    }

    this.signup = () => {
	console.log('Auth0Controller signup');
	auth.signup({ popup: true }, successCb, errorCb);
    }

    this.reset = () => {
	console.log('Auth0Controller logout');
	auth.reset({ popup: true }, successCb, errorCb);
    }

    this.logout = () => {
	console.log('Auth0Controller logout');
	auth.signout();
    }

    this.login();
}
