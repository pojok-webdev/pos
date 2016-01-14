/// <reference path="../../typings/tsd.d.ts" />

themeConfig.$inject = ['$mdThemingProvider'];

export default function themeConfig($mdThemingProvider ) {
    $mdThemingProvider.theme('default')
	.primaryPalette('red', {
	    'default': '500', // by default use shade 400 from the pink palette for primary intentions
	    'hue-1': '600', // use shade 100 for the <code>md-hue-1</code> class
	    'hue-2': '700', // use shade 600 for the <code>md-hue-2</code> class
	    'hue-3': 'A100' // use shade A100 for the <code>md-hue-3</code> class
	})
	.accentPalette('grey', {
	    'default': '700', // by default use shade 400 from the pink palette for primary intentions
	    'hue-1': '600', // use shade 100 for the <code>md-hue-1</code> class
	    'hue-2': '400', // use shade 600 for the <code>md-hue-2</code> class
	    'hue-3': 'A100' // use shade A100 for the <code>md-hue-3</code> class
	})
}
