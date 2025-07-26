const express = require("express");
const router = express.Router();
exports.router = router;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Post = require("../Models/post.model.js");
const User = require("../Models/user.model.js");
const Category = require("../Models/category.model.js");

const authMiddleware = require("../Utils/auth.middleware.js");
const generateApiKey = require("../Utils/generateApiKey.js");
const automate = require("../Utils/automate.js");

const locals = {
    title: "BiographyHub",
    imageUrl: "/IMG/brand-image.png",
    description:
        "Stay ahead with expert insights on AI, emerging tech, digital marketing strategies, and productivity tools to supercharge your growth.",
    url: "https://biographyhub.onrender.com/admin"
};
exports.locals = locals;

router.use(authMiddleware);
const adminController = require("../Controllers/admin.controller.js")

/**
 * GET
 * ADMIN - get all posts related to a single user
 * For now it should find all posts*
 * requires authentication with "authMiddleware"
 */

router.get("/", adminController.getAllPosts);



/**
 * POST
 * ADMIN -create post
 * now working perfectly(not yet)
 * still requires authentication with "authMiddleware"
 */

router.post("/posts", adminController.postCreatePost);

/**
 * GET
 * ADMIN -edit post
 * excecuted successfully(not yet)
 * still requires authentication with "authMiddleware"
 */
router.get("/posts/:id", async (req, res, next) => {
    try {
        let currentPost = await Post.findById(req.params.id);
        locals.title = "Edit post | BiographyHub";

        let { userId } = req.session;
        const currentUser = await User.findById(userId);

        let authorized =
            currentPost.authorId === currentUser._id ||
            currentUser.roles.includes("admin");

        if (!authorized) {
            return res.status(403).json({
                success: false,
                message: "insufficient authorization"
            });
        }

        // return res.status(200).json({
        //     succes: true,
        //     message: "post retrieved successfully",
        //     currentPost
        // });

        return res.render("Pages/Admin/edit_post", {
            locals,
            currentPost,
            layout: "Layouts/admin"
        });
    } catch (err) {
        next(err);
    }
});

/**
 * PUT
 * ADMIN -edit-post
 * completed successfully
 */

router.post("/posts/:id", async (req, res, next) => {
    try {
        let { title, content, tags, imageUrl } = req.body;

        req.body.tags ? req.body.tags.split(",") : null;

        let updatedPost = await Post.findByIdAndUpdate(
            req.params.id,
            {
                $set: {
                    ...req.body,
                    updatedAt: Date.now()
                }
            },
            { new: true }
        );
        if (!updatedPost) {
            return res.status(201).json({
                success: false,
                message: "post not found and could not be updated"
            });
        }
        // return res.status(201).json({
        //     success: true,
        //     message: "post updated successfully",
        //     updatedPost
        // });

        return res.redirect("/admin/");
    } catch (error) {
        next(error);
    }
});
/**
 * DELETE
 * ADMIN - delete post
 * I should use the DELETE method, not GET
 */

router.delete("/posts/:id", async (req, res, next) => {
    try {
        let deletedPost = await Post.findByIdAndDelete(req.params.id);

        if (!deletedPost) {
            return res.status(201).json({
                success: false,
                message: "post could not be deleted"
            });
        }
        return res.status(201).json({
            success: true,
            message: "post deleted successfully",
            deletedPost
        });
    } catch (err) {
        next(err);
    }
});
module.exports = router;
