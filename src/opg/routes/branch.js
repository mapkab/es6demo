var express = require('express');
var router = express.Router();
var constants = require('../config/constants');
var request = require('request');
var rp = require('request-promise');

router.get('/get', function(req, res, next) {
  var access_token = new Buffer(req.session.userInfo.access_token, 'base64').toString();
  // var defaultGitID = encodeURIComponent(constants.defaultGitID);
  var defaultGitID = '';
  var sourceGitUrl = req.query.sourceGitUrl;
  if(sourceGitUrl) {
    // 获取仓库名。
    sourceGitUrl = sourceGitUrl.substr(0, sourceGitUrl.lastIndexOf('.git'));
    sourceGitUrl = sourceGitUrl.split('/').slice(sourceGitUrl.split('/').length - 2, sourceGitUrl.split('/').length).join('/');
    defaultGitID = sourceGitUrl;
  }
  defaultGitID = encodeURIComponent(defaultGitID);
  console.log(defaultGitID + '  ...................');
  request(constants.gitApiBasePath + 'projects/'+defaultGitID+'/repository/branches?access_token=' + access_token + '', function (error, response, body) {
     console.log(response.statusCode);
     if (!error && response.statusCode == 200) {
       // 返回数组
       res.json({message:'success', data:JSON.parse(body)});
     } else {
       res.json({message:'error', data:[]});
     }
   });
/*
  var options = {
    uri:constants.gitApiBasePath + 'projects/'+constants.defaultGitID+'/repository/branches',
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
    res.json({message:'success', data:repos});
    return;
  }).catch(function (err) {
    console.log('get the branchs failed...' + err);
    res.json({message:'error', data:[]});
  });*/
});

module.exports = router;
