var Sighting = require('../models/sightings');


exports.getAll = function(callback) {
    Sighting.find({}, function(err, sightings) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, sightings);
        }
    });
};