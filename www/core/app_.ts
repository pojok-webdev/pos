/// <reference path="../../typings/tsd.d.ts" />

require('angular-material/angular-material.css');

const routerConfig = require('./router.ts');

// if (ON_TEST) {
    // require('angular-mocks/angular-mocks');
// }

export default angular.module('app', [
    require('angular-material'),
    require('angular-ui-router'),
    require('angular-touch'),
    require('../components/home/home.ts').name,
    require('../components/page2/page2.ts').name,
    require('../components/users/users.ts').name,
    require('../components/users/users.detail.ts').name,
  //  require('../components/aws/aws.ts').name,
    require('../components/auth0/auth0.ts').name,
])
    .config(routerConfig)
    .name
