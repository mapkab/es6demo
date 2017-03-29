var express = require('express');
var router = express.Router();
var constants = require('../config/constants');

router.get('/', function(req, res, next) {
  res.render('index');
});

module.exports = router;
