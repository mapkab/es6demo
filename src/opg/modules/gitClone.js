
var fs = require('fs');
var execSync = require('child_process').execSync;
var exec = require('child_process').exec;
var iconv = require('iconv-lite');
var encoding = 'cp936';
var binaryEncoding = 'binary';
var common = require('../modules/common');
var config = require('../config/config');

module.exports =  {
    initUserInfo: function () {
    },
    cloneProject:function (req, gitUrl, destPath, callback) {
        fs.access(destPath + '/' + gitUrl.name, fs.F_OK, function (err) {
            if(err) {
                execSync(config.cd + destPath + ' && git clone -b ' + gitUrl.branch + ' ' + common.joinUserNameAndPass(req, gitUrl.url), function(err, stdout, stderr){
                    if(err || stderr) {
                        callback(null, "false");
                        console.log(iconv.decode(new Buffer(stderr, binaryEncoding), encoding));
                        return;
                    }
                    callback(null , 'true');
                    console.log(iconv.decode(new Buffer(stdout, binaryEncoding), encoding), iconv.decode(new Buffer(stderr, binaryEncoding), encoding));
                });
            }
            // 如果存在该项目则去更新
            exec(config.cd + destPath + '/' + gitUrl.name + ' && git pull ' , function(err, stdout, stderr){
                if(err || stderr) {
                    callback(null, "false");
                    console.log(iconv.decode(new Buffer(stderr, binaryEncoding), encoding));
                    return;
                }
                console.log(iconv.decode(new Buffer(stdout, binaryEncoding), encoding));
                callback(null , 'true');
            });
        });
    }
}


