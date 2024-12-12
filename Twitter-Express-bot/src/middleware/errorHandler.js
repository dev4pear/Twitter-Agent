const logger = require('../utils/logger');

module.exports = (err, req, res, next) => {
    logger.error(err.stack);

    if (err.name === 'MulterError') {
        return res.status(400).json({
            error: 'File upload error',
            message: err.message
        });
    }

    res.status(err.status || 500).json({
        error: 'Internal Server Error',
        message: err.message
    });
};
