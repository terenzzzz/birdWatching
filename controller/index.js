var Sighting = require('../models/sightings');


exports.getAll = function(callback) {
    console.log("getAll")
    Sighting.find({}, function(err, sightings) {
        if (err || !sightings) {
            // 如果出现错误或没有获取到数据，手动创建错误对象
            err = new Error('Failed to retrieve sightings from the database.');
            callback(err, null);
        } else {
            callback(null, sightings);
        }
    });
};

exports.getIndexDBData= function(callback){

}