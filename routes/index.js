var express = require('express');
var router = express.Router();
var controller = require('../controller/create')
const {log} = require("debug");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('onBoarding');
});

router.get('/index', function(req, res, next) {
  res.render('index');
});


// For testing add sighting to mongoDB
router.get('/add', function(req, res, next) {
  controller.createSighting(req,res)
      .then(function(insertedId) {
        console.log(insertedId)})
      .catch(function(err) {
        console.error(err);
      });
})

router.get('/create', function(req, res, next) {
  res.render('create');
});
module.exports = router;
