var express = require('express');
var router = express.Router();
var bodyParser= require("body-parser");
var sighting = require('../controller/sightings');
var index = require('../controller/index');
var multer = require('multer');
const Sighting = require("../models/sightings");
const mongoose = require('mongoose');

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
router.get('/bird/:id', function(req, res) {
    const birdId = req.params.id;
    console.log(birdId)
    Sighting.findOne({ _id: birdId }, function(err, sighting) {
        if (err) throw err;

        res.render('bird', { sighting: sighting });
    });
});

// GET edit sighting page
router.get('/bird/:id/edit', function(req, res) {
    let birdId = req.params.id;

    // Retrieve the sighting from the database
    Sighting.findOne({ _id: birdId }, function(err, sighting) {
        if (err) throw err;

        // Render the edit sighting page with the current values of the sighting's fields
        res.render('edit_bird', {sighting: sighting});
    });
});
router.post('/bird/:id/edit', function(req, res) {
    let birdId = req.params.id;
    console.log('Bird ID:', birdId);
    console.log('Request body:', req.body);

    // Find the sighting record in the database and update its fields
    Sighting.findOneAndUpdate({_id: birdId}, req.body, { new: true }, function(err, sighting) {
        if (err) {
            console.error(err);
            res.status(500).send('Error updating sighting');
        } else {
            console.log('Sighting updated:', sighting);
            res.redirect('/bird/' + birdId);
        }
    });
});

module.exports = router;
