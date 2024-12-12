const { Scraper } = require('agent-twitter-client');
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const { Cookie } = require('tough-cookie');
const logger = require('../utils/logger');
const config = require('../config/config');

class TwitterService {
    constructor() {
        this.scraper = new Scraper();
        this.cookiePath = path.join(__dirname, '../../cookies.json');
        this.isLoggedIn = false;
    }

    async initialize() {
        try {
            await this.loadCookies();
            
            if (!this.isLoggedIn) {
                logger.info('Logging in...');
                await this.login();
            }
            logger.info('Twitter service initialized!');
        } catch (error) {
            logger.error('Init error:', error);
            throw error;
        }
    }

    async login() {
        try {
            await this.scraper.login(
                config.twitter.username,
                config.twitter.password,
                config.twitter.email
            );
            this.isLoggedIn = true;
            const cookies = await this.scraper.getCookies();
            await this.saveCookies(cookies);
            logger.info('Login successful!');
        } catch (error) {
            logger.error('Login error:', error);
            throw error;
        }
    }

    async loadCookies() {
        try {
            if (fsSync.existsSync(this.cookiePath)) {
                const cookiesData = await fs.readFile(this.cookiePath, 'utf8');
                const cookiesJson = JSON.parse(cookiesData);
                
                const cookies = cookiesJson.map(cookieData => {
                    try {
                        return Cookie.fromJSON(cookieData);
                    } catch (e) {
                        logger.warn('Failed to parse cookie:', e);
                        return null;
                    }
                }).filter(cookie => cookie !== null);

                if (cookies.length > 0) {
                    await this.scraper.setCookies(cookies);
                    this.isLoggedIn = await this.scraper.isLoggedIn();
                    logger.info('Cookies loaded successfully');
                } else {
                    logger.info('No valid cookies found');
                    this.isLoggedIn = false;
                }
            } else {
                logger.info('No existing cookies found');
            }
        } catch (error) {
            logger.error('Cookie loading error:', error);
            this.isLoggedIn = false;
        }
    }

    async saveCookies(cookies) {
        try {
            const cookiesJson = cookies.map(cookie => cookie.toJSON());
            await fs.writeFile(this.cookiePath, JSON.stringify(cookiesJson, null, 2));
            logger.info('Cookies saved successfully');
        } catch (error) {
            logger.error('Cookie saving error:', error);
        }
    }

    getMimeType(filePath) {
        const ext = path.extname(filePath).toLowerCase();
        const mimeTypes = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.mp4': 'video/mp4',
            '.mov': 'video/quicktime'
        };
        return mimeTypes[ext] || null;
    }

    async prepareMediaData(files) {
        try {
            const mediaData = [];
            
            for (const file of files) {
                const data = await fs.readFile(file.path);
                const mediaType = file.mimetype;
                
                mediaData.push({
                    data: data,
                    mediaType: mediaType
                });

                // Clean up uploaded file
                await fs.unlink(file.path);
            }

            return mediaData;
        } catch (error) {
            logger.error('Media preparation error:', error);
            return [];
        }
    }

    async post(text, files = []) {
        try {
            if (!this.isLoggedIn) {
                await this.initialize();
            }

            const mediaData = files.length > 0 ? await this.prepareMediaData(files) : [];
            await this.scraper.sendTweet(text, undefined, mediaData);
            
            logger.info(`Tweet sent${mediaData.length > 0 ? ` with ${mediaData.length} media attachments` : ''}`);
            return true;
        } catch (error) {
            logger.error('Posting error:', error);
            throw error;
        }
    }

    async reply(tweetId, text, files = []) {
        try {
            if (!this.isLoggedIn) {
                await this.initialize();
            }

            const mediaData = files.length > 0 ? await this.prepareMediaData(files) : [];
            await this.scraper.sendTweet(text, tweetId, mediaData);
            
            logger.info(`Reply sent to tweet ${tweetId}`);
            return true;
        } catch (error) {
            logger.error('Reply error:', error);
            throw error;
        }
    }
}

module.exports = new TwitterService();
