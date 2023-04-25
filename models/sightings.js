let mongoose = require('mongoose');
var Schema = mongoose.Schema;

var sightingSchema = new Schema({
    identification: {type: String, required: true, max: 100},
    nickName: {type: String, required: true, max: 100},
    description: {type: String, required: true, max: 100},
    dateTime: {type: String, required: true, max: 100},
    latitude: {type: String},
    longitude: {type: String},
    photo: {type: String, required: true, max: 100}
});

var Sighting = mongoose.model('Sighting', sightingSchema)

module.exports = Sighting;

