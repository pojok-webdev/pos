/// <reference path="../../../typings/tsd.d.ts" />

require('auth0-angular');
const pouchdb = require('pouchdb');
pouchdb.plugin(require('pouchdb-upsert'));

export default angular.module('app.login', [
    'auth0',
    require('angular-storage'),
    require('angular-jwt'),

])
    .directive('gandalfLogin', gandalfLogin)
    .name

// gandalfLogin.$inject = ['idToken', 'accessToken', 'state', 'refreshToken', 'baguLogin', 'CognitoCredentials'];

//function gandalfLogin(idToken, accessToken, state, refreshToken, baguLogin, CognitoCredentials) {
gandalfLogin.$inject = ['$mdDialog'];
function gandalfLogin($mdDialog) {
    return {
	restrict: 'EA',

	templateUrl: 'components/login/login.html',

	controller: ['$scope', 'baguLogin', 'sampleData','$location','commonLib',function($scope, baguLogin, sampleData,$location,commonLib) {
	    $scope.isLogin = baguLogin.isLogin();
		$scope.profile = baguLogin.profile()
	    $scope.loginSelectItems = [
		    { id: 'logout', label: 'Logout'},
		    { id: 'edit', label: 'Edit Profile'},
			{ id: 'preferences', label: 'Preferences'},
	    ];

	    $scope.loginSelectModel = $scope.loginSelectItems[0];

	    $scope.login = () => {
		// let that = this;

		successCallback.$inject = ['profile', 'idToken', 'accessToken', 'state', 'refreshToken'];

		function successCallback(profile, idToken, accessToken, state, refreshToken) {
		    // console.log('successCallback profile:', profile);
		    $scope.isLogin = true;
//			$scope.profile = profile;
//			console.log('PROFILE',profile)
		}

		function errorCallback() {
		    console.log('errorCallback');
		}

		baguLogin.login(successCallback, errorCallback);

		$scope.loginSelectItems = [
		    { id: 'logout', label: 'Logout'},
		    { id: 'edit', label: 'Edit Profile'},
			{ id: 'preferences', label: 'Preferences'},
		];
		$scope.loginSelectModel = $scope.loginSelectItems[0];
	    }

		var that = this;
		that.curRegister = {};
		
		
	    $scope.loginSelectChange = (item) => {
		var dbUserProfile = new pouchdb('userProfile');

		console.log('loginSelectModel:', item);
			switch (item.id.toLowerCase()) {
				case 'logout':
				console.log('LOGOUT CLICKED')
					baguLogin.logout();
					$scope.isLogin = baguLogin.isLogin();
					break;
		
				case 'preferences':
					var dbregisters = new pouchdb('registers');
					var dbDeviceProfile = new pouchdb('deviceProfile');
					dbUserProfile.createIndex({fields:['_id']})
					.then(idx=>{
						dbUserProfile.find({selector:{_id:'userProfile'}})
						.then(res=>{
							if(res.docs.length){
								var _userProfile = res.docs[0];
								console.log('user profile',_userProfile);
								dbregisters.allDocs({include_docs:true})
								.then(res=>{
									var _registers = [];
									res.rows.forEach(row=>{
									_registers.push(row.doc);
									});
									return _registers;
								})
								.then(_registers=>{
									var curReg = {};
									/**/
									var dbDeviceProfile = new pouchdb('deviceProfile');
									dbDeviceProfile.createIndex({
									fields:['_id']
									})
									.then(idx=>{
											dbDeviceProfile.find({
											selector:{_id:'choosenRegister'}
										})
										.then(res=>{
											console.log('CHOOZEN REGISTERx',res);
											if(res.docs.length){
												return res.docs[0].curRegister;
											}else{
												console.log('YOU HAVE NO REGISTER');
											}
										})
										.then(curRegister=>{
											console.log('REGISTER GOT',curRegister);
											this.register = curRegister;
											//this.choosenRegister = curRegister;
											$scope.$apply();
											$mdDialog.show({
												templateUrl: 'components/login/editPreferences.html',
												parent: angular.element(document.body),
												clickOutsideToClose:true,
												controller:['$scope','registers','choosenRegister',function($scope,registers,choosenRegister){
												//console.log('OBJ:',obj);
												var that = this;
												this.registers = _registers;//obj.registers;
												$scope.choosenRegister = curRegister;
												console.log('tjcur register',curRegister);
												//console.log('scope register',$scope.choosenRegister);
												this.savePreferences = ()=>{
													//console.log('CHOOSENREGISTER',$scope.choosenRegister);
													$mdDialog.hide($scope.choosenRegister);
												}
												this.closePreferences = ()=>{
													$mdDialog.hide();
												}
												this.createSampleData = ()=>{
													console.log('that userprofile',_userProfile);
												sampleData.initData(_userProfile);
												}
												this.clearData = ()=>{
												sampleData.clearAllAsync()
												.then(res=>{
													console.log("clear all accomplished",res);
													$mdDialog.hide();
												})
												.catch(err=>{
													console.log("clear all error",err);
												});
												}
												}],
												controllerAs:'preferences',
												locals:{registers:_registers,choosenRegister:curRegister}
												})
											.then(function(choosenRegister){
												console.log('DATA RECEIVED',choosenRegister);
												dbDeviceProfile.createIndex({
												fields:['_id']
											})
											.then(idx=>{
												dbDeviceProfile.find({
												selector:{_id:'choosenRegister'}
											})
											.then(res=>{
												console.log('CHOOZEN REGISTER',res);
												return res;
											})
											.then(res=>{
												dbDeviceProfile.upsert('choosenRegister',doc=>{
												doc.curRegister = choosenRegister;
												return doc;
											})
											.then(res=>{
												console.log('SUCCESS UPSERT',res);
											})
											.catch(err=>{
												console.log('ERROR UPSERT',err);
											});
										});
									});
								})
										
								return {registers:this.register,curRegister: this.register};
								});
								});
								})
								
								
							}else{
								console.log('USER SHOULD CREATE PROFILE BEFORE CREATE DEVICE PROFILE');
								commonLib.showAlert('Alert','You should create User Profile before create Device Profile');
							}
						});
					});
				break;
				case 'edit':
					dbUserProfile.createIndex({fields:['_id']})
					.then(res=>{
						dbUserProfile.find({selector:{_id:'userProfile'}})
						.then(res=>{
							that.userProfile = res.docs[0];
							$scope.$apply();
							console.log('USER PROFILE EXISTS',that.userProfile);
							$mdDialog.show({
								templateUrl: 'components/login/editProfile.html',
								parent: angular.element(document.body),
								clickOutsideToClose:true,
								controller:['$scope','user',function($scope,user){
									$scope.user = that.userProfile;
									this.saveProfile = (user)=>{
										console.log('USER PROFILE ',that.userProfile);
										$mdDialog.hide({answer:'save',user:user});
									};
									this.closeDialog = ()=>{
										$mdDialog.hide({answer:'cancel'});
									}
									this.clearData = ()=>{
										var myProfile = that.userProfile;
										myProfile._deleted = true;
										dbUserProfile.put(myProfile)
										.then(res=>{
											console.log('Success remove user profile',res);
										})
										.catch(err=>{
											console.log('Error remove user profile',err);
										});
									}
								}],
								controllerAs:'profile',
								locals:{user:this.userProfile}
							})
							.then(obj=>{
								if(obj.answer!=='cancel'){
									console.log('USER PROFILE',obj.user);
									dbUserProfile.upsert('userProfile',doc=>{
										doc.name = obj.user.name;
										doc.address = obj.user.address;
										doc.email = obj.user.email;
										doc.city = obj.user.city;
										doc.phone = obj.user.phone;
										return doc;
								
									})
									.then(res=>{
										console.log('Upsert res',res);
										this.userProfile = res;
									});									
								}
							});
						})
						.catch(err=>{
							console.log('user profie erro',err);
						});
						
					})
				break;
			}
	    }

	}],

	link: function($scope, element, attrs) {
	    element.bind('click', function() {
		console.log('Clickety-click');
	    });
	    element.bind('mouseover', function() {
		element.css('cursor', 'pointer');
	    });
	}
    }

}
