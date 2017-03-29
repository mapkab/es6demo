/**
 * Created by lishengyong on 2016/11/1.
 */

var path = require('path');
var debug = true;
var config = {
    cd:'cd ',
    rootPath: '/home/lishengyong/web/opt/opg',
    projectPath:'/home/lishengyong/web/builderUP',
    dataProjectInit: '/home/lishengyong/web/builderUP/config/data-project-init.json',
    gomeplusUIPath:'/home/lishengyong/web/opt/opg/UI',
    gomeplusUIStaticPath:'/home/lishengyong/web/builderUP/public/gomeplusUI',
    projectName:'builderUP',
    compileFileName:'dist'
};

if(debug) {
    config.cd = 'E: && cd ';
    config.rootPath = 'E:\\work\\opg';
    config.projectPath = 'E:\\work\\webstorm-ws\\builderUP';
    config.dataProjectInit = 'E:\\work\\webstorm-ws\\builderUP\\config\\data-project-init.json';
    config.gomeplusUIPath = 'E:\\work\\opg\\UI\\';
    config.gomeplusUIStaticPath = 'E:\\work\\webstorm-ws\\builderUP/public/gomeplusUI';
}

module.exports = config;

