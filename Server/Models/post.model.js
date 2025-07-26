const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
    {
        title: {
            required: true,
            type: String
        },
        content: {
            type: String,
            required: true
        },
        description: {
            type: String
        },
        authorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user"
        },
        imageUrl: {
            type: String,
            default: `https://picsum.photos/seed/${getRandomText()}/600/400`
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "category"
        },
        tags: [String],
        status: {
            type: String,
            enum: ["published", "draft", "archived"],
            default: "draft"
        },
        meta: {
            views: {
                type: Number,
                default: 0
            },
            likes: {
                type: Number,
                default: 0
            },
            commentsCount: {
                type: Number,
                default: 0
            },
            sources: [
                {
                    _id: false,
                    name: String,
                    count: {
                        type: Number,
                        default: 1
                    }
                }
            ]
        }
    },
    { timestamps: true }
);

postSchema.index({ authorId: 1 });

postSchema.virtual("slug").get(function () {
    let regex = new RegExp("[^\\w]+", "ig");
    return this.title.toLowerCase().replace(regex, "-") + "--" + this._id;
});
postSchema.virtual("readTime").get(function () {
    const words = this.content.split(" ").length;
    return Math.ceil(words / 200) + " min read";
});

postSchema.index({
    title: "text",
    content: "text",
    tags: "text"
});

module.exports = mongoose.models.post || mongoose.model("post", postSchema);

function getRandomText(length = 6) {
    const chars = "1234567890abcdefghijklmnopqrstuvwxyz";
    let randomText = "";

    for (i = 0; i < length; i++) {
        let randomIndex = Math.floor(Math.random() * 36);
        randomText += chars[randomIndex];
    }
    return randomText;
}
