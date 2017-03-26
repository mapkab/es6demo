/*
created by Mapk
2017.3.26
*/
//observer.js
var data = { name: 'Mapk'};
observe(data);
data.name = 'mapkVolkov';

//observe 监听函数
function observe(data){
	//假如data不存在或者data数据类型不是object的退出函数
	if(!data || typeof data !== 'object'){
		return;
	}
	//遍历并取出data所有可枚举属性key
	Object.keys(data).forEach(function(key){
		defineReactive(data,key,data[key]);
	});
}

//defineReactive 数据绑定函数
function defineReactive(data,key,val){
	observe(val); //监听data的子属性
	//劫持data对象的setter和getter
	Object.defineProperty(data,key,{
		enumrable: true, //data对象属性可在for in，Object.keys()中遍历枚举；
		configurable: false,
		get: function(){
			return val;
		},
		set: function(newVal){
			console.log('observe' + val + 'to' + newVal);
			val = newVal;
		}
	});
}