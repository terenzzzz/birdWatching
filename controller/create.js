const Sighting = require('../models/sighting')

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";


exports.createSighting = function (req,res) {
    return new Promise((resolve, reject) => {
        MongoClient.connect(url, function(err, db) {
            if (err) {
                console.log('Error connecting to MongoDB: ', err);
                reject(err);
                return;
            }

            console.log('Connected successfully to server');
            var dbo = db.db("birdWatching");
            var mySighting = new Sighting({
                description: "Testing Description",
                dateTime: new Date(),
                nickName: "terenzzzz",
                latitude: 53,
                longitude: 42,
                identification: "Unknown",
                photo: "testing"
            });
            dbo.collection("sighting").insertOne(mySighting, function(err, result) {
                if (err) {
                    console.log('Error inserting document: ', err);
                    reject(err);
                    return;
                }
                console.log('Document inserted successfully');
                db.close();
                resolve(result.insertedId);
            });
        });
    });

}

