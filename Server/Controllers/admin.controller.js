const mongoose = require("mongoose");;
const Category = require("../Models/category.model");
const { router, locals } = require("../Routes/admin.routes");

exports.getAllPosts = async (req, res, next) => {
    try {
        let { userId } = req.session;
        let currentUser = await User.findById(userId);

        if (!currentUser) {
            return res.status(403).json({
                success: false,
                message: "user not logged in"
            });
        }
        let currentUserPosts = [];

        if (currentUser.roles.includes("admin")) {
            currentUserPosts = await Post.find({});
        } else {
            currentUserPosts = await Post.find({ authorId: currentUser._id });
        }

        locals.title = "Admin Dashboard | BiographyHub";

        res.render("Pages/Admin/dashboard", {
            locals,
            currentUserPosts,
            layout: "Layouts/admin"
        });
    } catch (err) {
        next(err);
    }
}

exports.postCreatePost = async (req, res, next) => {
    try {
        let { userId } = req.session;
        const currentUser = await User.findOne({ _id: userId });

        if (!currentUser) {
            return res.status(403).json({
                success: false,
                message: "user not logged in"
            });
        }

        if (!req.body) {
            return res.status(400).json({
                success: false,
                message: "empty request"
            });
        }

        const {
            title,
            description,
            content,
            imageUrl,
            tags,
            category,
            subCategory
        } = req.body;

        let parent = await Category.findOneAndUpdate(
            {
                name: category.toLowerCase().trim()
            },
            {
                $setOnInsert: {
                    name: category.toLowerCase().trim(),
                    parent: null,
                    slug: category.toLowerCase().trim().replace(/\W+/gi, "-")
                },
                $inc:{post_count: 1}
            },
            { upsert: true, new: true }
        );

        // let mainCategory = await Category.findOneAndUpdate(
        //     { name: subCategory },
        //     {
        //         $set: {
        //             name: subCategory,
        //             parent: parent._id,
        //             ancestors: [...parent.ancestors, parent._id],
        //             slug: (subCategory )?.toLowerCase().trim().replace(/\W+/g, "-")
        //         }
        //     },
        //     { upsert: true, new: true }
        // );

        //let description = await generateDescription(content)
        //let title = await generateTitle(content)

        let newPost = new Post({
            ...req.body,
            category: parent._id,
            authorId: currentUser?._id
            // ,category: mainCategory._id,
        });
        
        await newPost.save();

        return res.status(201).json({
            success: true,
            message: "post created successfully",
            data: newPost
        });

    } catch (err) {
        next(err);
    }
}