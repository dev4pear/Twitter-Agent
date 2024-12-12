require('dotenv').config();

module.exports = {
    port: process.env.PORT || 3000,
    twitter: {
        username: process.env.TWITTER_USERNAME,
        password: process.env.TWITTER_PASSWORD,
        email: process.env.TWITTER_EMAIL
    }
};
