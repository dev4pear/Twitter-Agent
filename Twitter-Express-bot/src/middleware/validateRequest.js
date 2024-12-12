const { body, param } = require('express-validator');

exports.validateTweet = [
    body('text')
        .notEmpty()
        .withMessage('Tweet text is required')
        .isLength({ max: 280 })
        .withMessage('Tweet must not exceed 280 characters')
];

exports.validateReply = [
    param('tweetId')
        .notEmpty()
        .withMessage('Tweet ID is required')
        .isString()
        .withMessage('Tweet ID must be a string'),
    body('text')
        .notEmpty()
        .withMessage('Reply text is required')
        .isLength({ max: 280 })
        .withMessage('Reply must not exceed 280 characters')
];
