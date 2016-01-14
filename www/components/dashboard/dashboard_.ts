const gandalf = require('gandalf-crud');

require('angular-chart.js/dist/angular-chart.css');

export default angular.module('app.Dashboard', [
    'chart.js'
])
    .controller('DashboardController', DashboardController)
    .name

DashboardController.$inject = ['$mdDialog', '$scope', 'ChartJs', 'baguLogin'];

function DashboardController($mdDialog, $scope, ChartJs, baguLogin) {
    var _this = this;
    var barLabels = [];
    var barData = [];
    var donutLabels = [];
    var donutData = [];

    gandalf.listAsync({ tableName: 'gandalf-companies', id: 'companyId' })
	.then( compRes => {
            this.companies = compRes.Items;
	    this.choice = this.companies[0];
            $scope.$apply()
	});

    this.changeCompany = function() {
        console.log('company change to', this.choice);
        gandalf.listByAsync('gandalf-stores', 'companyId', this.choice.companyId)
            .then( res => {
                this.stores = res.Items;
                // $scope.store = undefined
                // this.barLabels = ['no data'];
                // this.barData = [[0]];
                this.updateDonut();
		this.updateBar();
            });
    }

    this.changeStore = function() {
        this.updateBar()
    }

    this.updateBar = function() {
        console.log('TIME0',_this.getDateTime(0))
        console.log('TIME7',_this.getDateTime(7))
        gandalf.listSpesificAsync({tableName:'gandalf-orders',id:'orderId'},{
            dateTime:{
                AttributeValueList:[_this.getDateTime(7),_this.getDateTime(-1)],
                ComparisonOperator:'BETWEEN'
            }
        })
        .then(function(res){
            console.log('SPESIFIC',res.Items)
            var scanResult = []
            for(var i = 0;i<res.Items.length;i++){
                //console.log('storeId',res.Items[i].storeId)
                scanResult.push(res.Items[i])
            }
            return scanResult
        })
        .then(function(scanResult){
            var _map = [], _reduce = [], _barData = [], _barSeries = [], _barLabels = []
            console.log('SCANRESULT',scanResult)
            console.log('SCOPE STORE',$scope.store)
            if(scanResult.length){
              for(var i=0;i<$scope.store.length;i++){
                  var  _lbarData = []
                for(var d=0; d< 8;d++){
                    var _dateTime = _this.getDateTime(d)
                    //console.log('_DATETIME',_dateTime)
                        _map = scanResult.map(function(x){
                            var _ldateTime = x.dateTime.split(" "),
                                ldateTime = _ldateTime[0]
                            if((x.storeId === $scope.store[i].storeId)&&(ldateTime === _dateTime)){
                                console.log('XTOTAL',x.total)
                                return x.total
                            }else{
                                return 0
                            }
                        })
                        _reduce = _map.reduce(function(prev,next){
                            return prev+next
                        })
                        _lbarData.push(_reduce)
                    }
                    _barData.push(_lbarData)
                }
                for(var s=0;s<$scope.store.length;s++){
                    _barSeries.push($scope.store[s].name)
                }
                for(var d=0; d< 8;d++){
                    _dateTime = _this.getDateTime(d)
                    _barLabels.push(_dateTime)
                }
            }else{
                console.log('no data')
            }
            _this.barData = _barData
            _this.barLabels = _barLabels
            _this.barSeries = _barSeries
            console.log('barseries',_barSeries)
            $scope.$apply()
        })
        .catch(function(err){
            console.log('error list spesific Async',err)
        })
    }

    this.updateDonut = function() {
        var _startDate = _this.startDate;
        var _endDate = _this.endDate,

        fstartDate = _startDate.getFullYear() + '-' + _this.addZero((_startDate.getMonth()+1),2) + '-' + _this.addZero(_startDate.getDate(),2),
        fendtDate = _endDate.getFullYear() + '-' + _this.addZero((_endDate.getMonth()+1),2) + '-' + _this.addZero(_endDate.getDate(),2)

        if (!this.choice){
            _this.showAlert('Attention','Please choose the company to show the cart')
        } else {
            gandalf.listByAsync('gandalf-stores', 'companyId', this.choice.companyId)
		.then(function(sres) {
		    var _mystack = []
		    for (var i = 0; i < sres.Items.length; i++) {
			var _storeId = sres.Items[i].storeId,
			_total = 0
			_mystack.push({ storeId: _storeId, name: sres.Items[i].name, total: _total })
		    }
		    return _mystack
		})
		.then(function(obj) {
		    var _barValues = [];
		    var _donutLabels = [];
		    var _donut = [];

		    for (var c = 0; c < obj.length; c++) {
			_donut[obj[c].storeId] = obj[c].name
			_donutLabels.push(obj[c].name)
		    }

		    return gandalf.listSpesificAsync({ tableName: 'gandalf-orders', id: 'orderId' }, {
			dateTime: {
			    AttributeValueList: [fstartDate, fendtDate],
			    ComparisonOperator: "BETWEEN"
			}
		    })
			.then(function(res) {
			    if (res.Items.length) {
				console.log('order exist')
				var _donutData = []
				for (var i = 0; i < _donutLabels.length; i++) {
				    var _map = res.Items.map(function(obj) {
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
			})
			.catch(function(err){
			    console.log('Error listSpesialAsync',err);
			    _this.showAlert('Attention','First Date should be lower than Second Date in Filter');
			})
			    })
	}
    }

    _this.startDate = new Date()
    _this.startDate.setDate(_this.startDate.getDate() - 7)
    _this.endDate = new Date()

    _this.showAlert = function(title,content) {
      var alert = $mdDialog.alert({
        title: title,
        content: content,
        ok: 'Close'
      });
      $mdDialog
        .show( alert )
        .finally(function() {
          alert = undefined;
        });
    }

    _this.addZero = function(num,numlength){
        var _num = num.toString()
        for(var i=_num.length;i<numlength;i++){
            _num = '0'+_num;
        }
        return _num;
    }

    _this.preventPopupKeyboard = function(){
        var _dtpckr = angular.element( document.querySelector( '.dtpcker' ) );
        console.log('preventkeyboard',_dtpckr)
        _dtpckr.blur()
    }

    _this.getDateTime = function(dayAgo: number) {
        var curdt = new Date();
        curdt.setDate(curdt.getDate() - dayAgo)

        var dt = _this.addZero(curdt.getDate(),2),
            mt = _this.addZero(curdt.getMonth()+1,2),
            yr = curdt.getFullYear(),
            hr = _this.addZero(curdt.getHours(),2),
            mn = _this.addZero(curdt.getMinutes(),2),
            sc = _this.addZero(curdt.getSeconds(),2);
        return yr + '-' + mt + '-' + dt;
    }
}
