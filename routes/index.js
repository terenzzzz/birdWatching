var express = require('express');
var router = express.Router();
var bodyParser= require("body-parser");
var sighting = require('../controller/sightings');
var index = require('../controller/index');
var multer = require('multer');
const Sighting = require("../models/sightings");
const Comment = require("../models/comments");

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
        if (err) {console.error("err:" + err)}
        else {
            res.render('index', { successful_create: false, sightings:sightings});
        }
    })
});


router.get('/create', function(req, res, next) {
    res.render('create');
});
router.post('/create', upload.single('image'), function(req, res) {
    // console.log(req);
    sighting.create(req,res);
    // res.render('index', { successful_create: true});
    // res.redirect('/index');

});

router.get('/bird/:id', function(req, res) {
    const idBird = req.params.id;
    console.log(idBird);

    // Retrieve the sighting object based on the birdId parameter
    Sighting.findOne({ _id: idBird }, function(err, sighting) {
        if (err) throw err;

        // Retrieve all comments for the bird sighting
        Comment.find({ idBird: idBird }, function(err, comments) {
            console.log(comments);
            if (err) throw err;

            // Render the bird view with the sighting and comments objects
            res.render('bird', { sighting: sighting, comments: comments });
        });
    });
});

router.post('/bird/:id/', (req, res) => {
    const comment = new Comment({
        idBird: req.params.id,
        content: req.body.content,
        nickname: req.body.nickname
    });
    comment.save()
        .then(savedComment => {
            res.json(savedComment);
            console.log("Success")
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Could not save comment' });
        });

});

// GET edit sighting page

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
