var express = require('express');
var router = express.Router();
var fs = require('fs');
var config = require('../config/config');

router.get('/dev', function(req, res, next) {
    fs.readFile(config.projectPath + '/public/markdown/profile-dev.md', function (error, data) {
        if(error) throw error;
        res.render('profile-dev', {content:data.toString()});
    });
});

router.get('/start', function(req, res, next) {
    fs.readFile(config.projectPath + '/public/markdown/profile-start.md', function (error, data) {
        if(error) throw error;
        res.render('profile-dev', {content:data.toString()});
    });
});

module.exports = router;
