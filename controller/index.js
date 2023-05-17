var Sighting = require('../models/sightings');

/**
 * Get All Sightings From MongoDb
 */
exports.getAll = function(callback) {
    Sighting.find({}, function(err, sightings) {
        if (err || !sightings) {
            err = new Error('Failed to retrieve sightings from the database.');
            callback(err, null);
        } else {
            callback(null, sightings);
        }
    });
};
