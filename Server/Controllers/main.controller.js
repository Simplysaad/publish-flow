const mongoose = require("mongoose");

const Post = require("../Models/post.model.js");
const User = require("../Models/user.model.js");
const Category = require("../Models/category.model.js");
const Search = require("../Models/search.model.js");

const helper = require("../Utils/helper");
const automate = require("../Utils/automate.js");
const searchPictures = require("../Utils/searchPicture.js");
const { generateSlug } = require("../Utils/generateSlug.js");

exports.getHome = async (req, res, next) => {
    try {
        //ENSURE THAT THE POSTS RETURNED ARE PUBLISHED {status: "published"}

        const allPosts = await Post.find({})
            .populate("category")
            .sort({ updatedAt: -1 })
            .limit(10)
            .select("title slug description category updatedAt imageUrl meta");

        const postsByCategory = await Post.aggregate([
            {
                $group: {
                    _id: "$category",
                    posts: { $push: "$$ROOT" }
                }
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "_id",
                    foreignField: "_id",
                    as: "category"
                }
            },
            {
                $unwind: "$category"
            },
            {
                $project: {
                    _id: 1,
                    name: "$category.name",
                    posts: 1
                }
            }
        ]);

        const recentPosts = await Post.find({})
            .sort({ updatedAt: -1 })
            .limit(10)
            .select("title slug description category updatedAt imageUrl meta");
        const topPosts = await Post.find({})
            .sort({ "meta.likes": -1, "meta.views": -1 })
            .limit(10)
            .select("title slug description category updatedAt imageUrl meta");

        return res.json({
            locals,
            allPosts,
            recentPosts,
            topPosts,
            postsByCategory
        });
    } catch (err) {
        next(err);
    }
};

exports.automate = async (req, res, next) => {
    try {
        const response = await automate();
        // const { newPost, twitterPost, success } = await response.json();
        // const data = await response.json();

        // if (!data.success) {
        //     return res.json({
        //         success: false,
        //         message: "could not be posted",
        //         response
        //     });
        // }
        return res.json({
            ...response
        });
    } catch (err) {
        next(err);
    }
};

exports.getAuthor = async (req, res, next) => {
    try {
        const { slug } = req.params;
        const authorId = slug?.split("-").at(-1) || slug
        const isValidObjectId = mongoose.Types.ObjectId.isValid(authorId);

        if (!slug || !isValidObjectId) {
            let [randomAuthor] = await User.aggregate([
                { $match: { roles: "author" } },
                { $sample: { size: 1 } },
                { $project: { _id: 1 } }
            ]);

            return res.redirect(`/author/${randomAuthor._id}`);
        }

        const authorPosts = await Post.find({ authorId });
        const author = await User.findById(authorId);

        return res.json({
            success: true,
            message: "author posts fetched successfully",
            authorPosts,
            author
        });
    } catch (err) {
        next(err);
    }
};

exports.getArticle = async (req, res, next) => {
    try {
        let { slug } = req.params;
        let articleId = slug.split("-").at(-1);

        let { like, source } = req.query;

        if (req.query.source) {
            source = req.query.source.toLowerCase().trim();

            let updatedArticle = await Post.findOneAndUpdate(
                { _id: articleId, "meta.sources.name": source },
                {
                    $inc: {
                        "meta.sources.$.count": 1
                    }
                },
                { new: true }
            );

            if (!updatedArticle) {
                updatedArticle = await Post.findOneAndUpdate(
                    { _id: articleId },
                    {
                        $push: {
                            "meta.sources": {
                                name: source,
                                count: 1
                            }
                        }
                    },
                    { new: true }
                );
            }
        }
        if (req.query.like) {
            await Post.findByIdAndUpdate(
                articleId,
                {
                    $inc: {
                        "meta.likes": 1
                    }
                },
                { new: true }
            );
            return res.status(204).end();
        }

        const article = await Post.findByIdAndUpdate(
            articleId,
            {
                $inc: {
                    "meta.views": 1
                }
            },
            { new: true }
        )
            .populate("authorId")
            .populate("category");

        const isValidObjectId = mongoose.Types.ObjectId.isValid(articleId);
        if (!isValidObjectId || !article) {
            let [article] = await Post.aggregate([{ sample: { size: 1 } }]);

            let slug = generateSlug(article);

            return res.redirect(
                `${locals.url}/article/${slug}?source=random_article`
            );
        }

        const { authorId: author } = article;
        const relatedPosts = await Post.aggregate([
            { $sample: { size: 6 } },
            {
                $lookup: {
                    from: "categories",
                    localField: "category",
                    foreignField: "_id",
                    as: "category"
                }
            }
        ]);

        relatedPosts.map(post => (post.slug = generateSlug(post)));

        locals.title = article.title + " - BiographyHub";
        locals.description = article.description;
        locals.imageUrl = article.imageUrl;

        let currentUrl = "https://biographyhub.onrender.com" + req.originalUrl;
        return res.json({
            success: true,
            message: "article fetched successfully",
            article,
            author,
            currentUrl,
            relatedPosts
        });
    } catch (err) {
        next(err);
    }
};

exports.postCategory = async (req, res) => {
    try {
        let categories = [
            {
                name: "Web development",
                description:
                    "Dive into the ever-evolving world of web development—where creative code meets beautiful design. From beginner basics to advanced trends, we help you build modern websites that wow, inspire, and connect people everywhere."
            },
            {
                name: "AI/ML",
                description:
                    "Step into the future with AI and machine learning! Explore groundbreaking stories, practical projects, and guides that reveal how machine intelligence is transforming everything from business and art to everyday life."
            },
            {
                name: "Frontend Frameworks",
                description:
                    "Discover the magic behind stunning, interactive sites—React, Angular, Vue, and more. We share hands-on tutorials, expert tips, and innovative ideas to help you craft seamless experiences your users will love."
            },
            {
                name: "Backend and Databases",
                description:
                    "Peek behind the curtain at the unsung heroes of every app—robust backends and reliable databases. Learn to create scalable, secure, and lightning-fast architectures that power the world’s most exciting digital products."
            },
            {
                name: "Productivity and Tools",
                description:
                    "Supercharge your workflow with proven productivity hacks, essential tools, and insider recommendations. Whether you’re coding, creating, or collaborating, we help you work smarter—not harder—every step of the way."
            },
            {
                name: "Security and best practices",
                description:
                    "Build with confidence by mastering security essentials and industry best practices. Explore strategies to protect your code, data, and users from today’s evolving threats—security starts here."
            },
            {
                name: "Tech News and Trends",
                description:
                    "Stay tuned to the pulse of the tech world. We bring you breaking news, bold innovations, and expert insights on the latest trends shaping tomorrow’s technology landscape."
            }
        ];

        await Promise.all(
            categories.map(async category => {
                let [image] = await searchPictures(category.name);
                category.imageUrl = image.urls.raw;
                category.name = category.name.toLowerCase().trim();
                category.slug = category.name
                    .trim()
                    .toLowerCase()
                    .replace(/\W+/g, "-");
            })
        );

        let newCategories = await Category.insertMany(categories);

        return res.status(201).json({
            success: true,
            message: "new categories added successfully",
            newCategories
        });
    } catch (err) {
        next(err);
    }
};

exports.getCategory = async (req, res, next) => {
    try {
        let { slug } = req.params;

        slug = slug.toLowerCase().split("-").join(" ");

        const category = await Category.findOne({ name: slug });
        const categoryPosts = await Post.find({
            category: category._id
        }).populate("category");

        locals.title = category.name + " - BiographyHub";
        locals.description = category.description;

        return res.json({
            success: true,
            message: "category posts fetched successfully",
            categoryPosts,
            category
        });
    } catch (err) {
        next(err);
    }
};

exports.postSubscribe = async (req, res, next) => {
    try {
        let { emailAddress, name } = req.body;
        let newSubscriber = new User({ emailAddress, name });

        await newSubscriber.save();
    } catch (error) {
        next(error);
    }
};

exports.allSearch = async (req, res, next) => {
    try {
        let { searchTerm, category, from, to = Date.now() } = req.query;
        let newRegex = new RegExp(searchTerm, "i");

        const { userId = null } = req.session;

        let filters = {};

        if (category) {
            filters.category = category;
        }
        if (from || to) {
            filters.updatedAt = {};
            if (from) filters.updatedAt.$gte = new Date(from);
            if (to) filters.updatedAt.$lte = new Date(to);
        }

        let searchResults = await Post.find(
            { $text: { $search: searchTerm }, ...filters },
            { score: { $meta: "textScore" } }
        )
            .sort({ score: { $meta: "textScore" } })
            .limit(20);

        let newSearch = await Search.findOneAndUpdate(
            { searchTerm },
            {
                $setOnInsert: {
                    searchTerm,
                    searchResults,
                    userId,
                    filters
                },
                $inc: {
                    searchCount: 1
                }
            },
            { upsert: true, new: true }
        );

        locals.title = `Results for ${searchTerm}`;
        locals.description = `Your search for ${searchTerm}, brought ${
            searchResults.length ?? "no"
        } results `;

        // return res.json({
        return res.json({
            success: true,
            message: "search results fetched successfully",
            searchTerm,
            searchResults
        });
    } catch (err) {
        next(err);
    }
};

exports.getAutocomplete = async (req, res, next) => {
    try {
        let { text } = req.query;
        const newRegex = new RegExp(text, "ig");

        let suggestions = await Search.find({
            searchTerm: { $regex: newRegex }
        }).limit(6);

        return res.status(200).json({
            success: true,
            message: "autocomplete successful",
            suggestions
        });
    } catch (err) {
        next(err);
    }
};
