const express = require('express');
const cors = require('cors');
const config = require('./config/config');
const twitterRoutes = require('./routes/twitterRoutes');
const errorHandler = require('./middleware/errorHandler');
const TwitterService = require('./services/TwitterService');
const logger = require('./utils/logger');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/twitter', twitterRoutes);

// Error handling
app.use(errorHandler);

// Initialize Twitter service and start server
TwitterService.initialize()
    .then(() => {
        app.listen(config.port, () => {
            logger.info(`Server is running on port ${config.port}`);
        });
    })
    .catch(error => {
        logger.error('Failed to initialize Twitter service:', error);
        process.exit(1);
    });
