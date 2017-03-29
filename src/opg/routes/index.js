var express = require('express');
var router = express.Router();
var menu = require('../config/data-menu.json');
var compileInfo = require('../config/data-project-init.json');
var constants = require('../config/constants');
var request = require('request');
var rp = require('request-promise');

function getBranches(req, defaultGitID) {
  var access_token = new Buffer(req.session.userInfo.access_token, 'base64').toString();
  var branches = [];
  /*  request(constants.gitApiBasePath + 'projects/'+defaultGitID+'/repository/branches?access_token=' + access_token + '', function (error, response, body) {
    console.log(response.statusCode);
    if (!error && response.statusCode == 200) {
      // 返回数组
      branches = JSON.parse(body);
    }
  });
  return branches;*/

  var options = {
    uri:constants.gitApiBasePath + 'projects/'+defaultGitID+'/repository/branches',
    qs:{
      access_token:access_token
    },
    headers: {
      'User-Agent': 'Request-Promise'
    },
    json: true
  }

  rp(options).then(function (repos) {
    console.log('User has %d repos', repos.length);
    branches = repos;
  }).catch(function (err) {
    // API call failed...
    console.log('get the branchs failed...');
  });
  return branches;
}

/* GET home page. */
router.get('/', function(req, res, next) {
  var resData  = {};
  var defaultGitID = encodeURIComponent(constants.defaultGitID);
  var branches = [];
  // 从session里获取登录信息， 如果获取到登录信息， 则直接跳转主页面，否则跳转登录页面
  if(req.session.userInfo){
    branches = getBranches(req, defaultGitID);

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

router.post('/logout', function(req, res, next) {
  req.session = null;
  res.redirect('/login');
});

module.exports = router;
