var Sighting = require('../models/sightings');

/**
 * Handling Sighting create into MongoDb
 */
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

    sighting.save(function (err, result) {
        if (err) {
            console.error('Error saving sighting:', err);
            res.status(500).send('Invalid data!');
        } else {
            res.status(200).send({ id: result._id });
            console.info("result._id:",result._id)
        }
    });
};


/**
 * Handling Sync Sightings into MongoDb
 */
exports.sync = function (req, res) {
    let sightings = JSON.parse(req.body.data)
    var files = req.files;
    var dataToSave = [];
    sightings.forEach(function (obj,key) {
        delete obj._id
        delete obj.id
        obj.photo = files[key].path
        dataToSave.push(obj)
    });

    Sighting.insertMany(dataToSave,function(err, result) {
        if (err) {
            console.log("Failed to insert many data into MongoDB")
            res.status(500).send('Failed to insert many data into MongoDB');
        } else {
            console.log("sync sightings finished!!!: ",result)
            res.status(200).send({result:result});
        }
    });

};




