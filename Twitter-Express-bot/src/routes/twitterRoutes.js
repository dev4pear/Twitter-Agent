const express = require('express');
const multer = require('multer'); // Add this line
const router = express.Router();
const upload = require('../middleware/multerconfig');
const twitterController = require('../controllers/twitterController');

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading
        return res.status(400).json({
            error: 'Upload Error',
            message: err.message
        });
    } else if (err) {
        // An unknown error occurred
        return res.status(400).json({
            error: 'File Error',
            message: err.message
        });
    }
    next();
};

// Apply the upload middleware with error handling
router.post('/tweet', 
    (req, res, next) => {
        upload.array('media', 4)(req, res, (err) => {
            if (err) {
                handleMulterError(err, req, res, next);
            } else {
                next();
            }
        });
    },
    twitterController.postTweet
);

router.post('/reply/:tweetId', 
    (req, res, next) => {
        upload.array('media', 4)(req, res, (err) => {
            if (err) {
                handleMulterError(err, req, res, next);
            } else {
                next();
            }
        });
    },
    twitterController.replyToTweet
);

module.exports = router;
