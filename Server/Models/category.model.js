const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        description: { type: String },
        image_url: { type: String },
        parent: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            default: null
        },
        ancestors: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Category"
            }
        ],
        meta: {
            seo_title: { type: String },
            seo_description: { type: String },
            keywords: [{ type: String }]
        },
        is_active: {
            type: Boolean,
            default: true
        },
        order: {
            type: Number,
            default: 0
        },
        post_count: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

// categorySchema.virtual("slug").get(function () {
//     return this.name.toLowerCase().replace(/\W+/g, "-") + "-" + this._id;
// });

module.exports = new mongoose.model("category", categorySchema);
