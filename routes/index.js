var express = require('express');
var router = express.Router();
var bodyParser= require("body-parser");
var sighting = require('../controller/sightings');
var index = require('../controller/index');
var multer = require('multer');

// storage defines the storage options to be used for file upload with multer
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/upload/');
    },
    filename: function (req, file, cb) {
        var original = file.originalname;
        var file_extension = original.split(".");
        // Make the file name the date + the file extension
        filename =  Date.now() + '.' + file_extension[file_extension.length-1];
        cb(null, filename);
    }
});
var upload = multer({ storage: storage });

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('onBoarding');
});


router.get('/index', function(req, res, next) {
    index.getAll(function(err, sightings) {
        if (err) {console.error(err)}
        else {
            res.render('index', { successful_create: false, sightings:sightings});
        }
    })

});


router.get('/create', function(req, res, next) {
    res.render('create');
});
router.post('/create', upload.single('image'), function(req, res) {
    console.log(req);
    sighting.create(req,res);
    // res.render('index', { successful_create: true});
    res.redirect('/index');
});
router.get('/bird', function(req, res, next) {
    res.render('bird');
});


module.exports = router;
