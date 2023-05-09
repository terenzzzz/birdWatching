var Sighting = require('../models/sightings');

exports.create = function (req, res) {
    var sighting = new Sighting({
        identification : req.body.identification,
        nickName: req.body.nickName,
        description: req.body.description,
        dateTime: req.body.dateTime,
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        photo: req.file.path
    });

    sighting.save(function (err, results) {
        if (err){
            res.status(500).send('Invalid data!')
        } else {
            res.status(200).send({id:results._id});
        };

    });
};






