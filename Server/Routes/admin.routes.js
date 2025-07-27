const express = require("express");
const router = express.Router();

const Post = require("../Models/post.model.js");
const User = require("../Models/user.model.js");
const Category = require("../Models/category.model.js");

const authMiddleware = require("../Utils/auth.middleware.js");

//router.use(authMiddleware);
const adminController = require("../Controllers/admin.controller.js")


router.get("/posts", adminController.getAllPosts); //COMPLETED

router.post("/posts", adminController.postCreatePost); // COMPLETED

router.get("/posts/:id", adminController.getSinglePost); // COMPLETED

router.put("/posts/:id", adminController.editPost); // COMPLETED

router.delete("/posts/:id", adminController.deletePost); // COMPLETED

router.all("/search", adminController.allSearch); // COMPLETED

router.get("/autocomplete", adminController.getAutocomplete);


module.exports = router;
