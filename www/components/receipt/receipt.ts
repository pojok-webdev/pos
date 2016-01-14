const gandalf = require('gandalf-crud');
export default angular.module('app.receipt', [])
    .controller('ReceiptController', ReceiptController)
    .name


ReceiptController.$inject = ['$scope','$http','$stateParams','$state'];
function ReceiptController($scope,$stateParams,$state) {
    var _this = this,
        objClass = {tableName:'gandalf-orders',id:'orderId'},
        obj = {orderId:$state.orderId};
        console.log('state',$state);
    gandalf.readAsync(objClass,obj)
    .then(function(res){
        console.log('Result',res)
        return $scope.$apply(_this.order = res.Item)
    })
    .catch(function(err){
        console.log(err);
    });
}