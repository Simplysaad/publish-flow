const mongoose = require("mongoose");
const Category = require("../Models/category.model");
const Post = require("../Models/post.model.js");
const User = require("../Models/user.model.js");
const Search = require("../Models/search.model.js");

exports.getAllPosts = async (req, res, next) => {
  try {
    let { userId = null } = req.session;
    let currentUser = await User.findById(userId);

    let currentUserPosts = [];
    currentUserPosts = await Post.find({});

    if (!currentUser) {
      return res.status(403).json({
        success: false,
        message: "user not logged in",
      });
    }

    // currentUserPosts = await Post.find({ authorId: currentUser._id });

    return res.status(200).json({
      success: true,
      message: "posts fetched successfully",
      currentUserPosts,
      currentUser,
    });
  } catch (err) {
    next(err);
  }
};

exports.postCreatePost = async (req, res, next) => {
  try {
    let { userId } = req.session;
    const currentUser = await User.findOne({ _id: userId });

    // if (!currentUser) {
    //   return res.status(403).json({
    //     success: false,
    //     message: "user not logged in",
    //   });
    // }

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
      category: mainCategory._id || parent._id,
      authorId: currentUser?._id,
    });

    await newPost.save();

    return res.status(201).json({
      success: true,
      message: "post created successfully",
      data: newPost,
      currentUser,
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

    const generateSlug = (post) => {
      return `${post.title.toLowerCase().trim().replace(/\W+/g, "-")}-${
        post._id
      }`;
    };
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
    let { title, content, description, tags, imageUrl } = req.body;

    if (tags) {
      if (!Array.isArray(tags)) {
        tags = tags.split(",");
      }
    }

    let updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          title,
          content,
          description,
          imageUrl,
          updatedAt: Date.now(),
        },
        $addToSet: { tags },
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
  } catch (error) {
    next(error);
  }
};

exports.deletePost = async (req, res, next) => {
  let deletedPost = await Post.findByIdAndDelete(req.params.id);

  if (!deletedPost) {
    return res.status(404).json({
      success: false,
      message: "post not found and could not be deleted",
    });
  }
  return res.status(201).json({
    success: true,
    message: "post deleted successfully",
    deletedPost,
  });
};

exports.allSearch = async (req, res, next) => {
  try {
    const { userId = null } = req.session;
    let {
      searchTerm,
      perPage = 20,
      page = 1,
      category,
      from,
      to = Date.now(),
    } = req.query;

    let filters = {};

    if (category) {
      let inCategory = await Category.findOne({
        name: category.trim().toLowerCase(),
      }).select("_id name");

      filters.category = inCategory?._id;
    }

    if (from || to) {
      filters.updatedAt = {};
      if (from) filters.updatedAt.$gte = new Date(from);
      if (to) filters.updatedAt.$lte = new Date(to);
    }
    console.log(filters);
    searchTerm = searchTerm.trim().toLowerCase();

    let searchResultsCount = await Post.countDocuments({
      $text: { $search: searchTerm },
      ...filters,
    });

    let searchResults = await Post.find(
      { $text: { $search: searchTerm }, ...filters },
      { score: { $meta: "textScore" } }
    )
      .sort({ score: { $meta: "textScore" } })
      .skip((page - 1) * perPage)
      .limit(perPage);

    let newSearch;
    if (searchResults.length > 0) {
      newSearch = await Search.findOneAndUpdate(
        { searchTerm },
        {
          $setOnInsert: {
            searchTerm,
            searchResults,
            userId,
            filters,
          },
          $inc: {
            searchCount: 1,
          },
        },
        { upsert: true, new: true }
      );
    }

    // return res.json({
    return res.status(201).json({
      success: true,
      message: `Your search for ${searchTerm}, brought ${
        searchResultsCount + " results" ?? "no result"
      }`,
      searchResults,
      searchResultsCount,
      newSearch,
    });
  } catch (err) {
    next(err);
  }
};

exports.getAutocomplete = async (req, res, next) => {
  try {
    let { text, perPage = 6 } = req.query;
    const newRegex = new RegExp(text, "ig");

    let suggestions = await Search.find({
      searchTerm: { $regex: newRegex },
    }).limit(perPage);

    return res.status(200).json({
      success: true,
      message: "autocomplete successful",
      suggestions,
    });
  } catch (err) {
    next(err);
  }
};
