const mongoose = require("mongoose");

const searchSchema = new mongoose.Schema(
    {
        searchTerm: {
            type: String
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users"
        },
        filters: {
            category: String,
            dateRange: {
                from: Date,
                to: Date
            }
        },
        searchCount: { type: Number, default: 1 },
        searchResults: [
            {
                _id: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "post"
                },
                title: {
                    type: String
                },        score: { type: Number, default: 0 },

            }
        ]
    },
    { timestamps: true }
);

searchSchema.index({
    searchTerm: "text"
});
module.exports = mongoose.model("search", searchSchema);
