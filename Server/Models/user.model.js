const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema(
    {
        //USER PROFILE
        name: {
            type: String,
            required: true
        },
        profileImage: {
            type: String,
            default: "https://picsum.photos/200"
        },
        bio: String,

        //LOGIN DETAILS
        password: {
            type: String
        },
        emailAddress: {
            type: String,
            required: true
        },
        phoneNumber: {
            type: String
        },
        roles: [
            {
                type: String,
                enum: ["author", "subscriber", "admin"],
                default: "subscriber"
            }
        ],

        //SOCIAL LINKS
        socials: [
            {
                name: {
                    type: String,
                    enum: ["twitter", "instagram", "medium", "linkedin"]
                },
                url: {
                    type: String
                }
            }
        ]
    },
    { timestamps: true }
);

UserSchema.index({ emailAddress: 1 }, { unique: true });
UserSchema.virtual("slug").get(function () {
    let regex = new RegExp("[^\\w]+", "ig");
    return this.name.toLowerCase().replace(regex, "-") + "--" + this._id;
});

module.exports = mongoose.models.user || mongoose.model("user", UserSchema);
