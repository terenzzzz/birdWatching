let mongoose = require('mongoose');
var Schema = mongoose.Schema;

var sightingSchema = new Schema({
    description: {type: String, required: true, max: 100},
    dateTime: {type: String, required: true, max: 100},
    nickName: {type: String, required: true, max: 100},
    latitude: {type: Number},
    longitude: {type: Number},
    identification: {type: String, required: true, max: 100},
    photo: {type: String, required: true, max: 100},
});

var Sighting = mongoose.model('sightingSchema', sightingSchema)

module.exports = Sighting;

