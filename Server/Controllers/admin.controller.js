const mongoose = require("mongoose");
const Category = require("../Models/category.model");
const Post = require("../Models/post.model.js");
const User = require("../Models/user.model.js");

exports.getAllPosts = async (req, res, next) => {
  try {
    let { userId } = req.session;
    let currentUser = await User.findById(userId);

    if (!currentUser) {
      return res.status(403).json({
        success: false,
        message: "user not logged in",
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
      layout: "Layouts/admin",
    });
  } catch (err) {
    next(err);
  }
};

exports.postCreatePost = async (req, res, next) => {
  try {
    let { userId } = req.session;
    const currentUser = await User.findOne({ _id: userId });

    if (!currentUser) {
      return res.status(403).json({
        success: false,
        message: "user not logged in",
      });
    }

    if (!req.body) {
      return res.status(400).json({
        success: false,
        message: "empty request",
      });
    }

    const {
      title,
      description,
      content,
      imageUrl,
      tags,
      category,
      subCategory,
    } = req.body;

    let parent = await Category.findOneAndUpdate(
      {
        name: category.toLowerCase().trim(),
      },
      {
        $setOnInsert: {
          name: category.toLowerCase().trim(),
          parent: null,
          slug: category.toLowerCase().trim().replace(/\W+/gi, "-"),
        },
        $inc: { post_count: 1 },
      },
      { upsert: true, new: true }
    );

    let mainCategory = await Category.findOneAndUpdate(
      { name: subCategory },
      {
        $set: {
          name: subCategory,
          parent: parent._id,
          ancestors: [...parent.ancestors, parent._id],
          slug: subCategory?.toLowerCase().trim().replace(/\W+/g, "-"),
        },
      },
      { upsert: true, new: true }
    );

    let newPost = new Post({
      ...req.body,
      category: parent._id,
      authorId: currentUser?._id,
      category: mainCategory._id,
    });

    await newPost.save();

    return res.status(201).json({
      success: true,
      message: "post created successfully",
      data: newPost,
    });
  } catch (err) {
    next(err);
  }
};
exports.getSinglePost = async (req, res, next) => {
  try {
    let { id: articleId } = req.params;
    let { like, source } = req.query;

    if (req.query.source) {
      source = req.query.source.toLowerCase().trim();

      let updatedArticle = await Post.findOneAndUpdate(
        { _id: articleId, "meta.sources.name": source },
        {
          $inc: {
            "meta.sources.$.count": 1,
          },
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
                count: 1,
              },
            },
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
            "meta.likes": 1,
          },
        },
        { new: true }
      );
      return res.status(204).end();
    }

    const article = await Post.findByIdAndUpdate(
      articleId,
      {
        $inc: {
          "meta.views": 1,
        },
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
          as: "category",
        },
      },
    ]);

    relatedPosts.map((post) => (post.slug = generateSlug(post)));
    const generateSlug = (post) => {
      return `${post.title.toLowerCase().trim().replace(/\W+/g, "-")}-${
        post._id
      }`;
    };

    return res.json({
      success: true,
      message: "article fetched successfully",
      article,
      author,
      relatedPosts,
    });
  } catch (err) {
    next(err);
  }
};

exports.deletePosts = async (req, res, next) => {
  try {
    let deletedPost = await Post.findByIdAndDelete(req.params.id);

    if (!deletedPost) {
      return res.status(201).json({
        success: false,
        message: "post could not be deleted",
      });
    }
    return res.status(201).json({
      success: true,
      message: "post deleted successfully",
      deletedPost,
    });
  } catch (err) {
    next(err);
  }
};

exports.editPost = async (req, res, next) => {
  try {
    let { title, content, tags, imageUrl } = req.body;

    req.body.tags ? req.body.tags.split(",") : null;

    let updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          ...req.body,
          updatedAt: Date.now(),
        },
      },
      { new: true }
    );
    if (!updatedPost) {
      return res.status(201).json({
        success: false,
        message: "post not found and could not be updated",
      });
    }
    return res.status(201).json({
      success: true,
      message: "post updated successfully",
      updatedPost,
    });

    return res.redirect("/admin/");
  } catch (error) {
    next(error);
  }
};


exports.deletePost = async (req, res, next)=>{

    let deletedPost = await Post.findByIdAndDelete(req.params.id);
    
    if (!deletedPost) {
        return res.status(201).json({
            success: false,
            message: "post could not be deleted",
        });
    }
    return res.status(201).json({
        success: true,
        message: "post deleted successfully",
        deletedPost,
    });
}