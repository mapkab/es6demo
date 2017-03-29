//webpack.config.js  --by mapk
var webpack = require("webpack");
var path = require('path');
//css样式从js文件中分离出来,需要通过命令行安装 extract-text-webpack-plugin依赖包
var ExtractTextPlugin = require('extract-text-webpack-plugin');

var myWebpack = {
	entry:[
		"webpack/hot/only-dev-server",
		path.resolve(_dirname, "../src/js/app.js")
	],
	output:{
		path: path.resolve(_dirname,"./dist"),
		filename:"app.js"
	},
	module: {
	    loaders: [
	        { test: /\.js$/, loaders:['babel','babel-loader','babel?presets=es2015'], exclude: /node_modules/ },
	        { test: /\.vue$/, loader:"vue"},
	        // { test: /\.css$/, loader: ExtractTextPlugin.extract('style', 'css')},
	        // { test: /\.scss$/, loader: ExtractTextPlugin.extract('style', 'css!sass')},
	        { test: /\.pug$/, loader: "pug"},

	        
	    ]
	},
	//.vue文件使用es6，sass、css样式提取
	vue:{
		loaders:{
			js:'babel',
			// sass: ExtractTextPlugin.extract('css!sass'),
			// css: ExtractTextPlugin.extract('css')
		}
	}
	resolve:{
	    extensions:['','.js','.json','.vue']
	 },
	 plugins: [
        new ExtractTextPlugin("index.css") //提取出来的样式放在.css文件中
    ]
}

module.export = myWebpack;