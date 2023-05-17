/**
 * Establish connection to MongoDB server
 */
let mongoose = require('mongoose');
let mongoDB = 'mongodb://127.0.0.1:27017/birdWatching';
mongoose.Promise = global.Promise;
try {
    connection = mongoose.connect(mongoDB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        checkServerIdentity: false,
    });
    console.log('connection to mongodb worked!');
} catch (e) {
    console.log('error in database connection: ' + e.message);
}