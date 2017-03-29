var express = require('express');
var router = express.Router();
var fs = require('fs');
var config = require('../config/config');
var clineProject = require('../modules/gitClone');
var config = require('../config/config');
var common = require('../modules/common');
var async = require('async');

router.get('/', function(req, res, next) {

    // 1. 检出UI以及UI依赖项目并且编译到public下
    var gitUrl = req.query.gitUrl;

    async.series(
        [
            function (callback) {
                clineProject.cloneProject(req, {
                    name: common.getProjName(gitUrl),
                    branch: 'develop',
                    url: gitUrl
                }, config.gomeplusUIPath, callback);
                
            },
            // 编译
            function (callback) {
                common.compileStatic('', config.gomeplusUIStaticPath);
                callback(null , 'true');
            }
        ], function (err, results) {
            res.redirect('gomeplusUI/html/index/index.html');
        }
    );
});


module.exports = router;
