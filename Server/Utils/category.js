const Category = require("../Models/category.model.js");

async function createCategory(name, parentName = null, description) {
    let ancestors = [];
    const parent = await Category.findOne({
        name: parentName?.toLowerCase()
    });

    // if (!parent)
    //     return res.status(404).json({
    //         success: false,
    //         message: "Parent category not found"
    //     });
    if (parent) {
        ancestors = [...parent.ancestors, parent._id];
    }

    const category = new Category({
        name,
        parent: parent?._id || null,
        ancestors
    });

    await category.save();
    category.slug =
        category.name.toLowerCase().replace(/!W+/g, "-") + "-" + category._id;
    await category.save();

    console.log(category);
    return category;
}
module.exports = createCategory;
