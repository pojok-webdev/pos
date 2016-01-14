const gandalf = require('gandalf-crud');
const pouchdb = require('pouchdb');
pouchdb.plugin(require('pouchdb-find'));
pouchdb.plugin(require('pouchdb-upsert'));
require('angular-chart.js/dist/angular-chart.css');

export default angular.module('app.Dashboard', [
    'chart.js'
])
    .controller('DashboardController', DashboardController)
    .name

DashboardController.$inject = ['$mdDialog', '$scope', 'ChartJs', 'baguLogin','commonLib','sampleData'];

function DashboardController($mdDialog, $scope, ChartJs, baguLogin,commonLib,sampleData) {
    var _this = this;
    var barLabels = [];
    var barData = [];
    var donutLabels = [];
    var donutData = [];
    var dbcompanies = new pouchdb('companies');
    var dbstores = new pouchdb('stores');
    var dbregisters = new pouchdb('registers');
    var dborders = new pouchdb('orders');
    var dbUserProfile = new pouchdb('userProfile');
    
    dbUserProfile.createIndex({fields:['_id']})
    .then(idx=>{
        dbUserProfile.find({selector:{_id:'userProfile'}})
        .then(res=>{
            _this.user = res.docs[0];
            $scope.$apply();
            dbcompanies.createIndex({fields:['user']})
            .then(idx=>{
                dbcompanies.find({selector:{user:_this.user}})
                .then(res=>{
                    var _companies = [];
                    res.docs.forEach(doc=>{
                        _companies.push(doc);
                    })
                    this.companies = _companies;
                    this.choice = this.companies[0];
                    this.populateStores();
                    $scope.$apply();
                });
            });
        });
    });

    this.populateStores = ()=>{
        var _stores = [];
        dbstores.createIndex({
            fields: ['companyId', 'storeId', 'name']
        })
            .then(res=> {
                dbstores.find({
                    selector: { companyId: this.choice.companyId },
                })
                    .then(res=> {
                        console.log('RES', res);
                        res.docs.forEach(row=> {
                            console.log('ROW', row);
                            _stores.push(row);
                        })
                        this.stores = _stores;
                        $scope.store = undefined;                            
                        _this.barLabels = ['no data']
                        _this.barData = [[0]]
                        
                        if(_stores.length>0){
                        _stores.forEach(store=>{
                            console.log('STORE',store);
                            //$scope.store = store;
                        })
                        //$scope.store = _stores[0];
                        }else{
                        }
                        $scope.$apply();
                        console.log('FIND RESULT', _stores);
                        this.updateDonut();
                        //            this.updateBar();
                    })
                    .catch(err=> {
                        console.log('ERROR FIND', err);
                    });
            })
            .catch(err=> {
                console.log('INDEX ERR', err);
            })
        
    }

    this.changeCompany = () => {
        console.log('COMPANY ID', this.choice.companyId);
        this.populateStores();
    }

    this.changeStore = function() {
        this.updateBar()
    }

    this.updateBar = () => {
        dborders.createIndex({
            fields: ['storeId']
        })
            .then(res=> {
                dborders.allDocs({ include_docs: true, attachments: true })
                    .then(res=> {
                        var scanResult = [];
                        res.rows.forEach(row=> {
                            //console.log('ROW DOC', row.doc);
                            scanResult.push(row.doc);
                        });

                        var _map = [], _reduce = [], _barData = [], _barSeries = [], _barLabels = []
                        if (scanResult.length) {
                            for (var i = 0; i < $scope.store.length; i++) {
                                //console.log('SCOPE I', $scope.store[i]);
                                var _lbarData = []
                                for (var d = 0; d < 8; d++) {
                                    var _dateTime = _this.getDateTime(d)
                                    _map = scanResult.map(function(x) {
                                        //console.log('X', x);
                                        if ((x.storeId === $scope.store[i].storeId) && (x.dateTime === _dateTime)) {
                                            //console.log('XTOTAL', x.total)
                                            return x.total
                                        } else {
                                            return 0
                                        }
                                    })
                                    _reduce = _map.reduce(function(prev, next) {
                                        return prev + next
                                    })
                                    _lbarData.push(_reduce)
                                }
                                _barData.push(_lbarData)
                            }
                            //console.log('_BARDATA', _barData);
                            for (var s = 0; s < $scope.store.length; s++) {
                                _barSeries.push($scope.store[s].name)
                            }
                            for (var d = 0; d < 8; d++) {
                                _dateTime = _this.getDateTime(d)
                                _barLabels.push(_dateTime)
                            }
                        } else {
                            console.log('no data')
                        }
                        _this.barData = _barData
                        _this.barLabels = _barLabels
                        _this.barSeries = _barSeries
                        console.log('barseries', _barSeries)
                        $scope.$apply()
                        console.log('ORDER RESULT', res);
                    })
                    .catch(err=> {
                        console.log('ORDER ERROR', err);
                    })
            })
            .catch(err=> {
                console.log('ORDER INDEX ERROR', err);
            });
    }

    this.updateDonut = () => {
        var _startDate = _this.startDate;
        var _endDate = _this.endDate,
            fstartDate = _startDate.getFullYear() + '-' + _this.addZero((_startDate.getMonth() + 1), 2) + '-' + _this.addZero(_startDate.getDate(), 2),
            fendtDate = _endDate.getFullYear() + '-' + _this.addZero((_endDate.getMonth() + 1), 2) + '-' + _this.addZero(_endDate.getDate(), 2)

       // console.log('CHOICE', this.choice);

        if (!this.choice) {
            commonLib.showAlert('Attention', 'Please choose the company to show the cart')
        } else {
            dbstores.createIndex({
                fields: ['companyId']
            })
                .then(indexRes=> {
                    dbstores.find({
                        selector: { companyId: this.choice.companyId }
                    })
                        .then(sres=> {
                            var _mystack = []
                            for (var i = 0; i < sres.docs.length; i++) {
                                var _storeId = sres.docs[i].storeId,
                                    _total = 0
                                _mystack.push({ storeId: _storeId, name: sres.docs[i].name, total: _total })
                            }
                            console.log('_MYSTACK', _mystack);
                            return _mystack
                        })
                        .then(obj=> {
                            var _barValues = [];
                            var _donutLabels = [];
                            var _donut = [];

                            for (var c = 0; c < obj.length; c++) {
                                _donut[obj[c].storeId] = obj[c].name
                                _donutLabels.push(obj[c].name)
                            }
                            dborders.createIndex({
                                fields: ['dateTime']
                            })
                            dborders.allDocs({ include_docs: true })
                                .then(res=> {
                                    console.log('ORDERS GOT',res.rows);
                                    var items = [];
                                    res.rows.forEach(row=> {
                                        items.push(row.doc);
                                    })
                                    if (items) {
                                        console.log('order exist')
                                        var _donutData = []
                                        for (var i = 0; i < _donutLabels.length; i++) {
                                            var _map = items.map(function(obj) {
                                                if (_donut[obj.storeId] === _donutLabels[i]) {
                                                    return obj.total
                                                } else {
                                                    return 0
                                                }
                                            })
                                            var _reduce = _map.reduce(function(prev, next) { return prev + next })
                                            _donutData.push(_reduce)
                                        }
                                        _this.donutLabels = _donutLabels;
                                        _this.donutData = _donutData;
                                        $scope.$apply();
                                        return obj;
                                    } else {
                                        console.log('order not exists');
                                        _this.donutLabels = ['no data'];
                                        _this.donutData = [[0]];
                                        $scope.$apply();
                                    }
                                    return res;

                                });
                        })
                        .catch(err=> {
                            console.log('ERROR FETCH', err);
                        });
                })
        }
    }
   
    _this.startDate = new Date()
    _this.startDate.setDate(_this.startDate.getDate() - 7)
    _this.endDate = new Date()

    /*_this.showAlert = function(title, content) {
        var alert = $mdDialog.alert({
            title: title,
            content: content,
            ok: 'Close'
        });
        $mdDialog
            .show(alert)
            .finally(function() {
                alert = undefined;
            });
    }*/

    _this.addZero = function(num, numlength) {
        var _num = num.toString()
        for (var i = _num.length; i < numlength; i++) {
            _num = '0' + _num;
        }
        return _num;
    }

    _this.preventPopupKeyboard = function() {
        var _dtpckr = angular.element(document.querySelector('.dtpcker'));
        console.log('preventkeyboard', _dtpckr)
        _dtpckr.blur()
    }

    _this.addCompany = function(){
        $mdDialog.show({
            templateUrl: 'components/company/addCompany.html',
            parent: angular.element(document.body),
            clickOutsideToClose:true,
			controller:['$scope',function($scope){
				$scope.site = _this.site;
               this.saveCompany = function(){	
                    console.log('CONMPANY SAVE INVOKED');	
                    var _companyId = commonLib.createId('company'),
                        obj = {
                            name:$scope.company.name,
                            address:$scope.company.address,
                            companyId:_companyId,
                            _id:_companyId,
                            user:_this.user
                        };
                    sampleData.createItem('companies',obj)	
                    $mdDialog.hide(obj);
                }
 			}],
			controllerAs:'cmp',
			locals:{}

        })
        .then(obj=>{
            _this.companies.push(obj);
        })
        console.log('openDialog');
    }

    _this.getDateTime = function(dayAgo: number) {
        var curdt = new Date();
        curdt.setDate(curdt.getDate() - dayAgo)

        var dt = _this.addZero(curdt.getDate(), 2),
            mt = _this.addZero(curdt.getMonth() + 1, 2),
            yr = curdt.getFullYear(),
            hr = _this.addZero(curdt.getHours(), 2),
            mn = _this.addZero(curdt.getMinutes(), 2),
            sc = _this.addZero(curdt.getSeconds(), 2);
        return dt + '/' + mt + '/' + yr;
    }
}
