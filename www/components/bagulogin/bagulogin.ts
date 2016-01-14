/// <reference path="../../../typings/tsd.d.ts" />

require('auth0-angular');

var AWS = (typeof window !== 'undefined') ? window.AWS : require('aws-sdk');

export default angular.module('app.bagulogin', [
    'auth0',
    require('angular-storage'),
    require('angular-jwt'),
])
    .run(baguloginRun)
    .config(baguloginConfig)
    .service('baguLogin', baguLogin)
    .service('CognitoCredentials', CognitoCredentials)
    .name


CognitoCredentials.$inject = [];

function CognitoCredentials() {
    this.credentials = {};
    this.get = () => this.credentials;
    this.set = (creds) => this.credentials = creds;

    this.updateLogin = (providerName, token) => {
        this.credentials.params.Logins = {};
        this.credentials.params.Logins[providerName] = token;
        this.credentials.expired = true;
    }
}

baguloginRun.$inject = ['$rootScope', 'auth', 'store', 'jwtHelper', 'CognitoCredentials'];

function baguloginRun($rootScope, auth, store, jwtHelper, CognitoCredentials) {
    AWS.config.region = 'us-east-1';

    let creds = AWS.config.credentials = new AWS.CognitoIdentityCredentials({
	IdentityPoolId: 'us-east-1:7c46cca3-ede1-4086-ab25-6eea224c7037',
    });

    CognitoCredentials.set(creds);

    $rootScope.$on('$locationChangeStart', () => {
	let token = store.get('token');

	if (token) {
	    if (!jwtHelper.isTokenExpired(token)) {
		if (!auth.isAuthenticated) {
		    auth.authenticate(store.get('profile'), token);
		}
	    } else {
		console.log('else');
		// TODO: show login page or use refresh toen to get a new idToken
	    }
	}
    });
}

baguLogin.$inject = ['auth', 'store', 'jwtHelper'];

function baguLogin(auth, store, jwtHelper) {
    this.isLogin = () => {
	let token = store.get('token');
	if (token) {
	    return true;
	} else {
	    return false;
	}
    }

    this.profile = () => {
	let profile = store.get('profile');
	if (profile) {
	    return profile;
	} else {
	    return false;
	}
    }


    this.login = (successCallback, errorCallback) => {
	auth.signin({}, successCallback, errorCallback);
    }

    this.logout = () => {
	auth.signout();
    }
}

baguloginConfig.$inject = ['authProvider'];

function baguloginConfig(authProvider) {
    authProvider.init({
	domain: 'louislarry.auth0.com',
	clientID: 'yrZ74GnnkjNpjKDbWlLPVtMkyTetcwm7',
    })

    authProvider.on('loginSuccess', ['store', 'profile', 'idToken', function(store, profile, idToken) {
	console.log('loginSuccess profile:', profile);
	console.log('loginSuccess idToken:', idToken);
	store.set('profile', profile);
	store.set('token', idToken);
    }]);

    authProvider.on('logout', ['store', function(store) {
	store.remove('token');
	store.remove('profile');

    }]);
}
