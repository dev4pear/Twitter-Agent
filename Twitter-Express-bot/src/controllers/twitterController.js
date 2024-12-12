const { validationResult } = require('express-validator');
const TwitterService = require('../services/TwitterService');
const logger = require('../utils/logger');

exports.postTweet = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { text } = req.body;
        const files = req.files || [];

        await TwitterService.post(text, files);
        
        res.status(200).json({
            message: 'Tweet posted successfully'
        });
    } catch (error) {
        next(error);
    }
};

exports.replyToTweet = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { tweetId } = req.params;
        const { text } = req.body;
        const files = req.files || [];

        await TwitterService.reply(tweetId, text, files);
        
        res.status(200).json({
            message: 'Reply posted successfully'
        });
    } catch (error) {
        next(error);
    }
};
