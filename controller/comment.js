var Comment = require('../models/comments');
/**
 * Handling Comments sync
 */
exports.syncComment = function (req, res) {
    let comments = req.body

    console.log(comments)

    Comment.insertMany(comments,function(err, result) {
        if (err) {
            console.log(err)
            res.status(500).send('Failed to insert many data into MongoDB');
        } else {
            res.status(200).send({result:200});
        }
    });

};