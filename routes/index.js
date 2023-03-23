var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('onBoarding');
});

router.get('/index', function(req, res, next) {
  res.render('index');
});
router.get('/create', function(req, res, next) {
  res.render('create');
});
module.exports = router;
