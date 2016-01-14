/// <reference path="../typings/tsd.d.ts" />

import * as angular from 'angular';
const app = require('./core/app.ts');

angular.element(document).ready(() => {
    if (window.cordova !== undefined) {
        console.info('boot: cordova is waiting for deviceready');
        document.addEventListener('deviceready', () => {
            angular.bootstrap(document, [app], {
                strictDi: true
            })
        }, false);
    } else {
        console.info('boot: running angular without cordova');
        angular.bootstrap(document, [app], {
            strictDi: true
        })
    }
});
