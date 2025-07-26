const express = require("express");
//const dummyData = require("./dummyData");
const router = express.Router();
const cron = require("node-cron");

const mainController = require("../Controllers/main.controller.js");
const Category = require("../Models/category.model.js");

router.use(async (req, res, next) => {
    try {
        const categories = await Category.find({})
            .select("_id name slug")
            .sort({ post_count: -1 });

        res.locals.categories = categories;
        next();
    } catch (err) {
        console.error(err);
    }
});
router.use(async (req, res, next) => {
    try {
        res.locals.getRelativeTime = dateString => {
            const now = new Date();
            const postDate = new Date(dateString);
            const seconds = Math.floor((now - postDate) / 1000);

            if (seconds < 60) return "just now";
            const minutes = Math.floor(seconds / 60);
            if (minutes < 60)
                return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
            const hours = Math.floor(minutes / 60);
            if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
            const days = Math.floor(hours / 24);
            if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
            const months = Math.floor(days / 30);
            if (months < 12)
                return `${months} month${months === 1 ? "" : "s"} ago`;
            const years = Math.floor(months / 12);
            return `${years} year${years === 1 ? "" : "s"} ago`;
        
        
        
        
        }
        next();
    } catch (err) {
        console.error(err);
    }
});

/**
 * GET
 * main -index page
 */

router.get("/", mainController.getHome);
router.get("/all-posts", async(req, res, next)=>{
    try {
        let allPosts = await Post.find({})

        return res.json({
            success: true, 
            message: "all posts retrieved successfully",
            allPosts
        })
    } catch (err) {
        next(err)
    }
});


router.get("/automate", mainController.automate);

/**
 * GET
 * MAIN -get all posts by the same author
 */

router.get(["/author/", "/author/:slug"], mainController.getAuthor);

/**
 * GET
 * MAIN - get a specific article
 * @params {String} id
 */

router.get(["/article/", "/article/:slug"], mainController.getArticle);

router.post("/category", mainController.postCategory);
/**
 * GET
 * MAIN - get all posts in the same category
 */

router.get("/category/:slug/", mainController.getCategory);

/**
 * GET
 * MAIN - search for posts that match the search searchTerm
 * search author, tags, content, title, imageUrl
 */

router.all("/search", mainController.allSearch);
router.get("/autocomplete", mainController.getAutocomplete);

/**
 * POST
 * MAIN - adds a new subscriber
 */

router.post("/subscribe", mainController.postSubscribe);

/**
 * 404
 * THIS PAGE COULD NOT BE FOUND
 */

router.get("/*path", (req, res, next) => {
    return res.render("Pages/Error/404", {});
});

module.exports = router;
