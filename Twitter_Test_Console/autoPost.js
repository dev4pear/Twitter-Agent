require('dotenv').config();
const { Scraper } = require('agent-twitter-client');
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const { Cookie } = require('tough-cookie');

class TwitterPost {
    constructor() {
        this.scraper = new Scraper();
        this.cookiePath = path.join(__dirname, 'cookies.json');
        this.isLoggedIn = false;
    }

    async initialize() {
        try {
            await this.loadCookies();
            
            if (!this.isLoggedIn) {
                console.log('Logging in...');
                await this.login();
            }
            console.log('Twitter poster initialized!');
        } catch (error) {
            console.error('Init error:', error);
            throw error;
        }
    }

    async login() {
        try {
            await this.scraper.login(
                process.env.TWITTER_USERNAME,
                process.env.TWITTER_PASSWORD,
                process.env.TWITTER_EMAIL
            );
            this.isLoggedIn = true;
            const cookies = await this.scraper.getCookies();
            await this.saveCookies(cookies);
            console.log('Login successful!');
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    async loadCookies() {
        try {
            if (fsSync.existsSync(this.cookiePath)) {
                const cookiesData = await fs.readFile(this.cookiePath, 'utf8');
                const cookiesJson = JSON.parse(cookiesData);
                
                // Convert JSON cookies to Cookie objects
                const cookies = cookiesJson.map(cookieData => {
                    try {
                        return Cookie.fromJSON(cookieData);
                    } catch (e) {
                        console.warn('Failed to parse cookie:', e);
                        return null;
                    }
                }).filter(cookie => cookie !== null);

                if (cookies.length > 0) {
                    await this.scraper.setCookies(cookies);
                    this.isLoggedIn = await this.scraper.isLoggedIn();
                    console.log('Cookies loaded successfully');
                } else {
                    console.log('No valid cookies found');
                    this.isLoggedIn = false;
                }
            } else {
                console.log('No existing cookies found');
            }
        } catch (error) {
            console.error('Cookie loading error:', error);
            this.isLoggedIn = false;
        }
    }

    async saveCookies(cookies) {
        try {
            // Convert Cookie objects to JSON-serializable format
            const cookiesJson = cookies.map(cookie => cookie.toJSON());
            await fs.writeFile(this.cookiePath, JSON.stringify(cookiesJson, null, 2));
            console.log('Cookies saved successfully');
        } catch (error) {
            console.error('Cookie saving error:', error);
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

    async prepareMediaData(mediaFiles) {
        try {
            const mediaData = [];
            
            for (const filePath of mediaFiles) {
                if (!fsSync.existsSync(filePath)) {
                    console.error(`File not found: ${filePath}`);
                    continue;
                }

                const data = await fs.readFile(filePath);
                const mediaType = this.getMimeType(filePath);
                
                if (!mediaType) {
                    console.error(`Unsupported file type: ${filePath}`);
                    continue;
                }

                mediaData.push({
                    data: data,
                    mediaType: mediaType
                });
            }

            return mediaData;
        } catch (error) {
            console.error('Media preparation error:', error);
            return [];
        }
    }

    async post(text, mediaFiles = []) {
        try {
            if (!this.isLoggedIn) {
                await this.initialize();
            }

            if (mediaFiles.length === 0) {
                await this.scraper.sendTweet(text);
                console.log('Text tweet sent:', text);
                return true;
            }

            // Prepare media data
            const mediaData = await this.prepareMediaData(mediaFiles);

            if (mediaData.length > 0) {
                // Send tweet with media
                await this.scraper.sendTweet(text, undefined, mediaData);
                console.log(`Tweet sent with ${mediaData.length} media attachments`);
            } else {
                // Fallback to text-only tweet
                await this.scraper.sendTweet(text);
                console.log('Media preparation failed, sent as text-only tweet');
            }

            return true;
        } catch (error) {
            console.error('Posting error:', error);
            throw error;
        }
    }

    async replyToTweet(tweetId, text, mediaFiles = []) {
        try {
            if (!this.isLoggedIn) {
                await this.initialize();
            }

            // Prepare media data
            const mediaData = await this.prepareMediaData(mediaFiles);

            // Send reply
            await this.scraper.sendTweet(text, tweetId, mediaData);
            console.log(`Reply sent to tweet ${tweetId}`);
            return true;
        } catch (error) {
            console.error('Reply error:', error);
            throw error;
        }
    }
}

// Command line usage
if (require.main === module) {
    const [,, command, ...args] = process.argv;

    if (!command) {
        console.log(`Usage: 
        Post tweet: node script.js tweet "Your tweet text" [media1.jpg media2.jpg ...]
        Reply to tweet: node script.js reply tweet_id "Your reply text" [media1.jpg media2.jpg ...]`);
        process.exit(1);
    }

    const poster = new TwitterPost();

    switch (command.toLowerCase()) {
        case 'tweet':
            const [text, ...mediaFiles] = args;
            if (!text) {
                console.log('Tweet text is required');
                process.exit(1);
            }
            poster.post(text, mediaFiles)
                .then(() => process.exit(0))
                .catch((error) => {
                    console.error('Error:', error);
                    process.exit(1);
                });
            break;

        case 'reply':
            const [tweetId, replyText, ...replyMedia] = args;
            if (!tweetId || !replyText) {
                console.log('Tweet ID and reply text are required');
                process.exit(1);
            }
            poster.replyToTweet(tweetId, replyText, replyMedia)
                .then(() => process.exit(0))
                .catch((error) => {
                    console.error('Error:', error);
                    process.exit(1);
                });
            break;

        default:
            console.log('Unknown command. Use "tweet" or "reply"');
            process.exit(1);
    }
}

module.exports = TwitterPost;
