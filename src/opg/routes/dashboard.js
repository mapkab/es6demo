var express = require('express');
var router = express.Router();
var menu = require('../config/data-menu.json');
var compileInfo = require('../config/data-project-init.json');
var constants = require('../config/constants');

var request = require('request');

/* GET home page. */
router.get('/', function(req, res, next) {

    request(constants.gitApiBasePath + 'projects/owned', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log(body);
        }
    });

    var resData  = {};
    if(req.session.userInfo){
        resData.login = true;
        resData.msg = '认证成功';
        resData.username = req.session.userInfo.username;
        resData.data = menu;
        resData.compileInfo = compileInfo;
        resData.defaultGit = constants.defaultGit;
        res.render('dashboard', resData);
        return;
    } else {
        res.render('login', {});
    }
});

module.exports = router;
