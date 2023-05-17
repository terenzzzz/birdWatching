/**
 * Comment model
 */
let mongoose = require('mongoose');
var Schema = mongoose.Schema;

var commentSchema = new Schema({
    idBird: {type: Schema.Types.ObjectId, ref: 'Sighting'},
    content: {type: String, required: true, max: 500},
    datetime: {type: Date, default: Date.now},
    nickname: {type: String, required: true, max: 100}
});

var Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
