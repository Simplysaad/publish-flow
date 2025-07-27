const express = require("express");
const router = express.Router();

const Post = require("../Models/post.model.js");
const User = require("../Models/user.model.js");
const Category = require("../Models/category.model.js");

const authMiddleware = require("../Utils/auth.middleware.js");

//router.use(authMiddleware);
const adminController = require("../Controllers/admin.controller.js")


router.get("/", adminController.getAllPosts);

router.post("/posts", adminController.postCreatePost);

router.get("/posts/:id", adminController.getSinglePost);
router.post("/posts/:id", adminController.editPost);

router.delete("/posts/:id", adminController.deletePost);


const allPosts = require("../posts.js")
router.post("/posts/insert-many", async(req, res, next)=>{
    try {
        let insertedPosts = await Post.insertMany(allPosts);
        return res.status(201).json({
            success: true,
            message: "Posts inserted successfully",
            data: insertedPosts
        });
    } catch (err) {
        next(err)
    }
})


module.exports = router;
