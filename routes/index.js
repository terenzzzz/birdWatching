var express = require('express');
var router = express.Router();
const createController = require('../controller/create')


/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('onBoarding');
});

router.get('/index', function(req, res, next) {
    res.render('index');
});

// For Testing add sighting to Mongodb
router.get('/addToMongo', function(req, res, next) {
    createController.createSighting().then(
        res.render('index')
    )
});

// router.get('/addToIDB', function(req, res, next) {
//
// });

router.get('/create', function(req, res, next) {
    res.render('create');
});
router.get('/bird', function(req, res, next) {
    res.render('bird');
});


module.exports = router;
