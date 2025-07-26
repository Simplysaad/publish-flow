const { TwitterApi } = require("twitter-api-v2");

const client = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY,
    appSecret: process.env.TWITTER_API_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});



async function postTweet(text, url, ...paths) {
    try {
        let response;
        text = text + "\n" + url;

        if (paths.length > 0) {
            const media_ids = [];
            for (let path of paths) {
                let mediaId = await client.v1.uploadMedia(path);
                media_ids.push(mediaId);
            }

            response = await client.v2.tweet({ text, media: { media_ids } });
        } else {
            response = await client.v2.tweet(text);
        }

        // return res.status(201).json({
        //     success: true,
        //     message: "posted to twitter successfully",
        //     data: response
        // });

        return response;
    } catch (error) {
        console.error("Error posting tweet:", error);
    }
}

module.exports = postTweet;



// To tweet an image from a URL using Node.js and Twitter API v2, you’ll:

// 1. Download the image from the URL (using e.g. `axios` or `request`).
// 2. Upload the image to Twitter with the v1.1 media endpoint.
// 3. Post a tweet attaching the received `media_id`.

// Sample code:

// ```js
// const axios = require('axios');
// const fs = require('fs');
// const Twitter = require('twitter-v2');
// const Twit = require('twit'); // for media upload

// const imageUrl = 'IMAGE_LINK_HERE'; // your image link

// // 1. Download the image
// axios({ url: imageUrl, responseType: 'stream' }).then(response => {
//   response.data.pipe(fs.createWriteStream('temp.jpg')).on('finish', () => {
//     // 2. Upload image using Twit (v1.1)
//     const T = new Twit({
//       consumer_key: 'YOUR_CONSUMER_KEY',
//       consumer_secret: 'YOUR_CONSUMER_SECRET',
//       access_token: 'YOUR_ACCESS_TOKEN',
//       access_token_secret: 'YOUR_ACCESS_SECRET'
//     });

//     const b64content = fs.readFileSync('temp.jpg', { encoding: 'base64' });

//     T.post('media/upload', { media_data: b64content }, (err, data, response) => {
//       const mediaIdStr = data.media_id_string;
//       // 3. Post tweet with media using Twitter v2
//       const client = new Twitter({
//         consumer_key: 'YOUR_CONSUMER_KEY',
//         consumer_secret: 'YOUR_CONSUMER_SECRET',
//         access_token_key: 'YOUR_ACCESS_TOKEN',
//         access_token_secret: 'YOUR_ACCESS_SECRET'
//       });

//       client.post('tweets', {
//         text: 'Check out this photo!',
//         media: { media_ids: [mediaIdStr] }
//       }).then(() => {
//         console.log('Tweet posted!');
//       });
//     });
//   });
// });
// ```

// Replace keys and image link with your actual data.  
// Want help with installing dependencies or getting your API keys? 🚀