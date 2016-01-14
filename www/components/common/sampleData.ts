const pouchdb = require('pouchdb');
pouchdb.plugin(require('pouchdb-find'));
pouchdb.plugin(require('pouchdb-upsert'));

export default angular.module('app.sampleData', ['ngMaterial'])
	.service('sampleData', sampleData)
    .name

sampleData.$inject = ['$rootScope','sampleImages'];
function sampleData($rootScope,sampleImages){
	var that = this;
	var sampledb = new pouchdb('sampledb');
	this.data = [];
	var dbUserProfile = new pouchdb('userProfile');
	

	this.createItem = (db,item)=>{
		var _db = new pouchdb(db);
		_db.put(item)
		.then(function(res){
			console.log('SUCCESS CREATE ITEM',res);
		})
		.catch(function(err){
			console.log('ERROR CREATE ITEM',err);
		})
	}
	
	this.createOrders = (orderId,registerId,storeId,companyId)=>{
		for(var i=0;i<8;i++){
			var randomVal = Math.random()*(200000-20000)+20000
			var curdt = new Date();
			curdt.setDate(curdt.getDate() - i);
			this.createItem('orders',{
				_id:orderId+i,
				userId:'sampleUser1',
				registerId:registerId,
				storeId:storeId,
				companyId:companyId,
				dateTime:this.getNDate(i),
				total:randomVal
			});
			
		}
	}
	
	this.showData = ()=>{
		var _rows = []
		sampledb.allDocs({include_docs:true,attachments:true})
		.then(function(res){
			res.rows.forEach(element => {
			//	sampledb.remove(element);
			//	sampledb.remove(element.doc);
			})
			//console.log('RESULT',res.rows)
			_rows = res.rows;
			that.data = res.rows;
			return res.rows;
			//$scope.$apply()
		});
		return _rows;
	}
	
	this.clearLocalData = (db,callback)=>{
		var _db = new pouchdb(db);
		_db.allDocs({include_docs:true,attachments:true})
		.then(function(res){
			res.rows.forEach(element => {
				_db.remove(element.doc);
			})
			callback(null,res);
			console.log('RESULT',res.rows)
		})
		.catch(err=>{
			callback(err);
		});
	}
	var Promise = require('bluebird');
	this.clearLocalDataAsync = Promise.promisify(this.clearLocalData)

	this.clearAll = (callback)=>{
		this.clearLocalDataAsync('companies')
		.then(res=>{
			return this.clearLocalDataAsync('stores')
			.then(res=>{
				return this.clearLocalDataAsync('registers')
				.then(res=>{
					return this.clearLocalDataAsync('orders')
					.then(res=>{
						return this.clearLocalDataAsync('catalogs')		
				 		.then(res=>{
							 return this.clearLocalDataAsync('products')
							 .then(res=>{
								 return callback(null,res);
							 })
							 .catch(err=>{
								 return callback(err);
							 });
						 })
						 .catch(err=>{
							 return callback(err);
						 });
					})
					.catch(err=>{
						return callback(err);
					});		
				})
				.catch(err=>{
					return callback(err);
				});		
			})
			.catch(err=>{
				return callback(err);
			});
		})
		.catch(err=>{
			return callback(err);
		});
	}

	this.clearAllAsync = Promise.promisify(this.clearAll);
	
	this.initData = (userProfile)=>{
		console.log('INIT DATA USER PROFILE',userProfile);
		var sampleCompany = {_id:'sampleCompany1',name:'SAMPLE COMPANY1'};
		var sampleStore = {_id:'sampleStore1',name:'SAMPLE STORE1',companyId:'sampleCompany1',address:'Address Store 1'};
		var sampleRegister = {_id:'sampleRegister1',name:'SAMPLE REGISTER1',storeId:'sampleStore1'};

		this.createItem('catalogs',{_id:'sampleCatalog1',catalogId:'sampleCatalog1',name:'Baju'})
		this.createItem('catalogs',{_id:'sampleCatalog2',catalogId:'sampleCatalog2',name:'Handphone'})
		
		this.createItem('products',{_id:'sampleProduct1',productId:'sampleProduct1',catalogId:'sampleCatalog1',productName:'sampleProduct1',categoryNames:'food',sellPrice:35000,imageUrl:sampleImages.getImage(7)});
		this.createItem('products',{_id:'sampleProduct2',productId:'sampleProduct2',catalogId:'sampleCatalog1',productName:'sampleProduct2',categoryNames:'food',sellPrice:36000,imageUrl:sampleImages.getImage(6)});
		this.createItem('products',{_id:'sampleProduct3',productId:'sampleProduct3',catalogId:'sampleCatalog1',productName:'sampleProduct3',categoryNames:'drink',sellPrice:15000,imageUrl:sampleImages.getImage(1)});
		
		this.createItem('products',{_id:'sampleProduct4',productId:'sampleProduct4',catalogId:'sampleCatalog2',productName:'sampleProduct4',categoryNames:'food',sellPrice:43000,imageUrl:sampleImages.getImage(7)});
		this.createItem('products',{_id:'sampleProduct5',productId:'sampleProduct5',catalogId:'sampleCatalog2',productName:'sampleProduct5',categoryNames:'food',sellPrice:34000,imageUrl:sampleImages.getImage(6)});
		this.createItem('products',{_id:'sampleProduct6',productId:'sampleProduct6',catalogId:'sampleCatalog2',productName:'sampleProduct6',categoryNames:'drink',sellPrice:8500,imageUrl:sampleImages.getImage(2)});
		
		this.createItem('companies',{_id:'sampleCompany1',companyId:'sampleCompany1',name:'SAMPLE COMPANY1',address:'Address Company 1',user:userProfile})
		this.createItem('companies',{_id:'sampleCompany2',companyId:'sampleCompany2',name:'SAMPLE COMPANY2',address:'Address Company 2',user:userProfile})
		this.createItem('companies',{_id:'sampleCompany3',companyId:'sampleCompany3',name:'SAMPLE COMPANY3',address:'Address Company 3',user:userProfile})

		this.createItem('stores',{
			_id:'sampleStore1',
			storeId:'sampleStore1',
			companyId:'sampleCompany1',
			name:'SAMPLE STORE 1',
			address:'ADDRESS STORE 1'
		});
		this.createItem('stores',{
			_id:'sampleStore2',
			storeId:'sampleStore2',
			companyId:'sampleCompany2',
			name:'SAMPLE STORE 2',
			address:'ADDRESS STORE 2'
		});
		this.createItem('stores',{
			_id:'sampleStore3',
			storeId:'sampleStore3',
			companyId:'sampleCompany3',
			name:'SAMPLE STORE 3',
			address:'ADDRESS STORE 3'
		});

		this.createItem('stores',{
			_id:'sampleStore4',
			storeId:'sampleStore4',
			companyId:'sampleCompany1',
			name:'SAMPLE STORE 4',
			address:'ADDRESS STORE 4'
		});
		this.createItem('stores',{
			_id:'sampleStore5',
			storeId:'sampleStore5',
			companyId:'sampleCompany2',
			name:'SAMPLE STORE 5',
			address:'ADDRESS STORE 5'
		});
		this.createItem('stores',{
			_id:'sampleStore6',
			storeId:'sampleStore6',
			companyId:'sampleCompany3',
			name:'SAMPLE STORE 6',
			address:'ADDRESS STORE 6'
		});


		this.createItem('stores',{
			_id:'sampleStore7',
			storeId:'sampleStore7',
			companyId:'sampleCompany1',
			name:'SAMPLE STORE 7',
			address:'ADDRESS STORE 7'
		});
		this.createItem('stores',{
			_id:'sampleStore8',
			storeId:'sampleStore8',
			companyId:'sampleCompany2',
			name:'SAMPLE STORE 8',
			address:'ADDRESS STORE 8'
		});
		this.createItem('stores',{
			_id:'sampleStore9',
			storeId:'sampleStore9',
			companyId:'sampleCompany3',
			name:'SAMPLE STORE 9',
			address:'ADDRESS STORE 9'
		});


		this.createItem('registers',{
			_id:'sampleRegister1',
			registerId:'sampleRegister1',
			storeId:'sampleStore1',
			catalogId:'sampleCatalog2',
			name:'SAMPLE REGISTER 1'
		});		
		this.createItem('registers',{
			_id:'sampleRegister2',
			registerId:'sampleRegister2',
			storeId:'sampleStore2',
			catalogId:'sampleCatalog2',
			name:'SAMPLE REGISTER 2'
		});		
		this.createItem('registers',{
			_id:'sampleRegister3',
			registerId:'sampleRegister3',
			storeId:'sampleStore3',
			catalogId:'sampleCatalog2',
			name:'SAMPLE REGISTER 3'
		});		

		this.createItem('registers',{
			_id:'sampleRegister4',
			registerId:'sampleRegister4',
			storeId:'sampleStore4',
			catalogId:'sampleCatalog2',
			name:'SAMPLE REGISTER 4'
		});		

		this.createItem('registers',{
			_id:'sampleRegister5',
			registerId:'sampleRegister5',
			storeId:'sampleStore5',
			catalogId:'sampleCatalog1',
			name:'SAMPLE REGISTER 5'
		});		
		
		this.createItem('registers',{
			_id:'sampleRegister6',
			registerId:'sampleRegister6',
			storeId:'sampleStore6',
			catalogId:'sampleCatalog1',
			name:'SAMPLE REGISTER 6'
		});		


		this.createItem('registers',{
			_id:'sampleRegister7',
			registerId:'sampleRegister7',
			storeId:'sampleStore7',
			catalogId:'sampleCatalog1',
			name:'SAMPLE REGISTER 7'
		});		

		this.createItem('registers',{
			_id:'sampleRegister8',
			registerId:'sampleRegister8',
			storeId:'sampleStore8',
			catalogId:'sampleCatalog1',
			name:'SAMPLE REGISTER 8'
		});		
		
		this.createItem('registers',{
			_id:'sampleRegister9',
			registerId:'sampleRegister9',
			storeId:'sampleStore9',
			catalogId:'sampleCatalog1',
			name:'SAMPLE REGISTER 9'
		});		

	
		this.createOrders('order1','sampleCompany1','sampleStore1','sampleRegister1');	
		this.createOrders('order2','sampleCompany2','sampleStore2','sampleRegister2');	
		this.createOrders('order3','sampleCompany3','sampleStore3','sampleRegister3');	
		this.createOrders('order4','sampleCompany1','sampleStore4','sampleRegister4');	
		this.createOrders('order5','sampleCompany2','sampleStore5','sampleRegister5');	
		this.createOrders('order6','sampleCompany3','sampleStore6','sampleRegister6');	
		this.createOrders('order7','sampleCompany1','sampleStore7','sampleRegister7');	
		this.createOrders('order8','sampleCompany2','sampleStore8','sampleRegister8');	
		this.createOrders('order9','sampleCompany3','sampleStore9','sampleRegister9');	

	}


	this.getNDate = function(dayAgo) {
		var curdt = new Date();
		curdt.setDate(curdt.getDate() - dayAgo);
		var	dt = curdt.getDate(),
			mt = curdt.getMonth()+1,
			yr = curdt.getFullYear(),
			hr = curdt.getHours(),
			mn = curdt.getMinutes(),
			sc = curdt.getSeconds();
		return dt + '/' + mt + '/' + yr;
		//return yr + '-' + mt + '-' + dt + ' ' + hr + ':' + mn + ':' + sc; 
	}

	this.showData();
	this.resetSampleData = ()=>{
		this.clearAllAsync();
		this.initData();
	}

}