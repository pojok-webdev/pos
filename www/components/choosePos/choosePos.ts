const gandalf = require('gandalf-crud');
export default angular.module('app.ChoosePos', ['ngMaterial'])
    .controller('ChoosePosController', ChoosePosController)
    .name


ChoosePosController.$inject = ['$mdDialog', '$scope'];
function ChoosePosController($mdDialog,$scope) {
    var _this = this
    gandalf.listAsync({tableName:'gandalf-registers',id:'registerWId'})
    .then(function(res){
        console.log('Success get registers',res)
        _this.registers = res.Items
        $scope.$apply()
    })
    .catch(function(err){
        console.log('Error get registers',err)
    })
_this.checkRegister = function(){
    if(!_this.register){
        return true
    }else{
        return false        
    }
}
}
