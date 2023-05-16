var express = require('express');
var router = express.Router();
const { SparqlEndpointFetcher } = require('fetch-sparql-endpoint');
var bodyParser= require("body-parser");
var sighting = require('../controller/sightings');
var comment = require('../controller/comment');
var index = require('../controller/index');
var multer = require('multer');
const Sighting = require("../models/sightings");
const Comment = require("../models/comments");
const fs = require('fs');

const myFetcher = new SparqlEndpointFetcher();

const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

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
router.post('/create', upload.single('photo'), function(req, res) {
    sighting.create(req,res);
});

router.get('/bird/:id', function(req, res) {
    const idBird = req.params.id;
    console.log(idBird)

    if (idBird === ":id") {
        return res.status(400).json({ error: 'Invalid ID' });
    }

    if (ObjectId.isValid(idBird)) {
        var dbpedia_exist = true;

        try {
            // Retrieve the sighting object based on the birdId parameter
            Sighting.findOne({ _id: idBird }, function(err, sighting) {
                if (err) throw err;

                if (!sighting) {
                    return res.status(404).json({ error: 'Sighting not found' });
                }
                var identification = sighting.identification;
                // if the identification is uncertain, then extract the name part only
                if (identification.includes('(Uncertain)')) {
                    identification = identification.substring(0, identification.indexOf(' (Uncertain)'));
                }
                // Capitalise the first letter and convert the rest to lowercase
                identification = identification.charAt(0).toUpperCase() + identification.slice(1).toLowerCase();
                // Check if the identification contains more than one word
                if (identification.includes(' ')) {
                    identification = identification.replace(/\s/g, '_');
                }

                Comment.find({ idBird: idBird }, function(err, comments) {
                    if (err) throw err;

                    // The DBpedia resource to retrieve data from
                    const resource = 'http://dbpedia.org/resource/' + identification;

                    // The DBpedia SPARQL endpoint URL
                    const endpointUrl = 'https://dbpedia.org/sparql';

                    // The SPARQL query to retrieve data for the given resource
                    const sparqlQuery = `SELECT ?label ?abstract ?thumbnail WHERE { <${resource}> rdfs:label ?label .
                  <${resource}> dbo:thumbnail ?thumbnail .
                  <${resource}> dbo:abstract ?abstract .
                  FILTER (langMatches(lang(?label),"en"))
                  FILTER (langMatches(lang(?abstract),"en"))
                }`;

                // Use SparqlEndpointFetcher() to retrieve the data
                myFetcher.fetchBindings(endpointUrl, sparqlQuery)
                    .then(bindingsStream => {
                        let dataReceived = false; // Flag to track if data was received
                        bindingsStream.on('data', (bindings) =>{
                            dataReceived = true; // Set the flag to true when data is received
                            let abstractValue = bindings.abstract.value;
                            let thumbnailValue = bindings.thumbnail.value;
                            let labelValue = bindings.label.value;
                            // Render the bird view with the sighting and comments objects
                            res.render('bird', { sighting: sighting, comments: comments, label: labelValue,
                                abstract: abstractValue, resource: resource, dbpedia_exist: dbpedia_exist, thumbnail:thumbnailValue});
                        });

                        bindingsStream.on('end', () => {
                            if (!dataReceived) {
                                dbpedia_exist = false;
                                // Render the bird view with the sighting and comments objects
                                res.render('bird', {
                                    sighting: sighting,
                                    comments: comments,
                                    dbpedia_exist: dbpedia_exist});
                            }
                        });
                    })
                });
            });

        } catch (err) {
            res.status(400).json({ error: 'Invalid ID' });
        }
    } else {
        let sighting = JSON.parse(req.query.sighting)
        let photo = req.query.photo

        console.log(photo)

        sighting.photo = photo

        console.log("Parsed Sighting:", sighting)
        dbpedia_exist = false;
        res.render('bird', { sighting: sighting, comments: [], dbpedia_exist: dbpedia_exist });
    }

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
           // console.log("Comment Saved")
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

router.post("/syncToMongo",upload.array('photo'),function(req, res) {
    // console.log(req.body)
    // console.log(req.files)
    sighting.sync(req,res);
//
})

router.post("/syncCommentToMongo",function(req, res) {
    // console.log(req.body)
    // console.log(req.files)
    console.log("/syncCommentToMongo")
    comment.syncComment(req,res);
//
})

module.exports = router;
