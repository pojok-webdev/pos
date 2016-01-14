/// <reference path="../../typings/tsd.d.ts" />

require('angular-material/angular-material.css');
require('angular-chart.js/dist/angular-chart.css');
require('./index.css');

const routerConfig = require('./router.ts');
const themeConfig = require('./theme.ts');

// if (ON_TEST) {
    // require('angular-mocks/angular-mocks');
// }

export default angular.module('app', [
    require('angular-material'),
    require('angular-chart.js').name,
    require('angular-material-icons'),
    require('angular-ui-router'),
    require('../components/home/home.ts'),
    require('../components/page2/page2.ts'),
    require('../components/catalog/catalog.ts'),
    require('../components/admin/admin.ts'),
    require('../components/sidemenu/sidemenu.ts'),
    require('../components/company/company.ts'),
    require('../components/site/site.ts'),
    require('../components/pos/pos.ts'),
    require('../components/product/product.ts'),
    require('../components/receipt/receipt.ts'),
    require('../components/dashboard/dashboard.ts'),
    require('../components/choosePos/choosePos.ts'),
    require('../components/bagulogin/bagulogin.ts'),
    require('../components/login/login.ts'),
    require('../components/common/commonLib.ts'),
    require('../components/common/sampleImages.ts'),
    require('../components/common/sampleData.ts'),
])
    .config(routerConfig)
    .config(themeConfig)
    .name
