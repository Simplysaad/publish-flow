const cron = require("node-cron");
//require("dotenv").config();

const generateTopic = require("./generateTopic.js");
const generatePost = require("./generatePost.js");
const postTweet = require("./postTwitter.js");
const { generateSlug } = require("./generateSlug.js");
const searchPicture = require("./searchPicture.js");

async function automate() {
    let post = await generatePost();

    let query = post.keywords || post.tags;
    let [image] = await searchPicture(query, 1);
    let altImageUrl = image.urls.raw + "&w=600&h=400";

    let prodMode = process.env.NODE_ENV === "production";

    const BASE_URL = prodMode ? process.env.PROD_URL : process.env.LOCAL_URL;

    let response = await fetch(`${BASE_URL}/admin/posts`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: process.env.BOT_API_KEY
        },
        body: JSON.stringify({ ...post, imageUrl: altImageUrl })
    });

    let { data: newPost } = await response.json();

    let slug = generateSlug(newPost);
    let url = `${BASE_URL}/article/` + slug + "?source=twitter";
     const twitterPost = await postTweet(newPost.description, url);

    return {
        newPost,
        altImageUrl,
        twitterPost
    };
}

module.exports = automate;

//results[0].urls.raw
