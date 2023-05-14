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



exports.sync = function (req, res) {
    let sightings = JSON.parse(req.body.data)
    console.log("sightings",sightings)
    // 获取上传的文件数组
    var files = req.files;
    console.log("files",files)

    // 创建一个新的对象数组，用于存储带有文件路径的数据
    var dataToSave = [];

    sightings.forEach(function (obj,key) {
        delete obj._id
        delete obj.id
        obj.photo = files[key].path
        dataToSave.push(obj)
    });

    console.log("dataToSave:",dataToSave)
    Sighting.insertMany(dataToSave,function(err, result) {
        if (err) {
            console.log("Failed to insert many data into MongoDB")
            res.status(500).send('Failed to insert many data into MongoDB');
        } else {
            res.status(200).send({result:result});
        }
    });

};




