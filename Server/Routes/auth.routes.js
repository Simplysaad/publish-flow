const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../Models/user.model.js");
const authMiddleware = require("../Utils/auth.middleware.js");

const locals = {
    title: "Auth - BiographyHub",
    imageUrl: "/IMG/brand-image.png",
    description:
        "Stay ahead with expert insights on AI, emerging tech, digital marketing strategies, and productivity tools to supercharge your growth.",
    url: "https://biographyhub.onrender.com/auth/login"
};
/**
 * POST
 * AUTH - subscribe page
 */
router.post("/subscribe", async (req, res, next) => {
    try {
        const { emailAddress } = req.body;
        const [name] = emailAddress.split("@");

        const updatedUser = await User.findOneAndUpdate(
            { emailAddress },
            {
                $setOnInsert: { name },
                $addToSet: { roles: "subscriber" }
            },
            {
                upsert: true,
                new: true
            }
        );

        //send welcome email, use nodemailer

        return res.status(201).json({
            success: true,
            message: "new subscriber added"
        });
    } catch (err) {
        next(err);
    }
});

/**
 * GET
 * AUTH - register page
 */
router.get("/register", async (req, res, next) => {
    try {
        locals.title = "Register - BiographyHub";
        locals.url = "https://biographyhub.onrender.com/auth/register";

        return res.render("Pages/Auth/register", {
            locals,
            layout: "Layouts/auth"
        });
    } catch (err) {
        next(err);
    }
});
/**
 * POST
 * AUTH - register
 * For register, the three things we have to do is:
 * * save info to mongodb
 * * create a new user
 * * sign the web token
 */

router.post("/register", async (req, res, next) => {
    try {
        const { password, emailAddress } = req.body;
        const { bio, phoneNumber, socials } = req.body;
        //socials = { name: "instagram", url: "https://instagram.com/" };

        const existingUser = await User.findOne({ emailAddress }).select(
            "_id roles emailAddress"
        );
        let hashedPassword = await bcrypt.hash(password, 10);
        let newUser;
        if (existingUser) {
            const isSubscriber = existingUser.roles?.includes("subscriber");
            const isAuthor = existingUser.roles?.includes("author");
            const isAdmin = existingUser.roles?.includes("admin");

            if (isAuthor || isAdmin) {
                return res.status(400).json({
                    success: false,
                    message: "user already exists"
                });
            }

            if (isSubscriber) {
                newUser = currentUser.findByIdAndUpdate(existingUser._id, {
                    $set: {
                        ...req.body,
                        roles: ["author", "subscriber"],
                        password: hashedPassword
                    }
                });
            }
        } else {
            newUser = new User({
                ...req.body,
                roles: ["author", "subscriber"],
                password: hashedPassword
            });

            await newUser.save();
        }

        const token = jwt.sign(
            { userId: newUser._id },
            process.env.SECRET_KEY,
            {
                expiresIn: "1h"
            }
        );

        req.session.userId = newUser._id;

        res.cookie("token", token, { httpOnly: true });
        //send welcome email, use nodemailer

        // return res.status(201).json({
        //     success: true,
        //     message: "new user created successfully",
        //     newUser
        // });

        return res.redirect("/admin/");
    } catch (err) {
        next(err);
    }
});

/**
 * GET
 * AUTH -login page
 */

router.get("/login", (req, res, next) => {
    try {
        locals.title = "Login - BiographyHub";
        locals.url = "https://biographyhub.onrender.com/auth/login";

        return res.render("Pages/Auth/login", {
            locals,
            layout: "Layouts/auth"
        });
    } catch (err) {
        next(err);
    }
});

/**
 * POST
 * AUTH -login
 * For login, the three things we have to do is:
 * * check info with mongodb
 * * create web token
 * * enter the dashboard if successful
 */

router.post("/login", async (req, res, next) => {
    try {
        const { emailAddress, password } = req.body;

        const currentUser = await User.findOne({
            emailAddress
        });

        if (!currentUser) {
            return res.status(404).json({
                success: false,
                message: "user not found"
            });
        }

        const isMatch = await bcrypt.compare(password, currentUser.password);
        if (!isMatch) {
            return res.status(403).json({
                success: false,
                message: "invalid credentials"
            });
        }
        req.session.userId = currentUser._id;

        const token = jwt.sign(
            { userId: currentUser._id },
            process.env.SECRET_KEY,
            {
                expiresIn: "1h"
            }
        );
        res.cookie("token", token, { httpOnly: true });
        // return res.status(200).json({
        //     success: true,
        //     message: "user logged in successfully",
        //     currentUser
        // });

        return res.redirect("/admin/");
    } catch (error) {
        next(error);
    }
});

/**
 * GET
 * AUTH - forgot password
 * send a token and verify user
 */

router.post("/forgot-password", async (req, res, next) => {
    try {
        let { emailAddress } = req.body;

        let existingUser = await User.findOne({ emailAddress }).select(
            "emailAddress _id"
        );

        if (!existingUser) {
            return res.status(400).json({
                success: false,
                message: "user does not exist"
                //Do not add this message, for security purposes
            });
        }

        // createToken and send
        let { _id: userId } = existingUser;

        let token = jwt.sign({ userId }, process.env.SECRET_KEY, {
            expiresIn: "20m"
        });

        //send reset password link via email, use nodemailer

        return res.status(200).json({
            success: true,
            message: "this token is valid.for only 20 minutes",
            token
            //,url: `http://localhost:3000/reset-password?t=${token}`
        });
    } catch (err) {
        next(err);
    }
});
router.get("/reset-password", async (req, res, next) => {
    try {
        let { t: token = null } = req.query;

        let decoded = jwt.verify(token, process.env.SECRET_KEY);

        if (!token) {
            return res.status(403).json({
                success: false,
                message: "invalid token"
            });
        }

        return res.status(200).json({
            success: true,
            message:
                "token verified successfully, redirecting to reset password page",
            decoded
        });
    } catch (err) {
        next(err);
    }
});
router.post("/reset-password", async (req, res, next) => {
    try {
        let { t: token = null } = req.query;
        let { password } = req.body;

        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        const { userId } = decoded;

        if (!decoded) {
            return res.status(403).json({
                success: false,
                message: "invalid token"
            });
        }

        let hashedPassword = await bcrypt.hash(password, 10);

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                $set: {
                    password: hashedPassword
                }
            },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(201).json({
                success: false,
                message: "user not found, so password could not be changed"
            });
        }

        //send notification email to notify of password change, use nodemailer

        return res.status(201).json({
            success: true,
            message: "password changed successfully"
        });
    } catch (err) {
        next(err);
    }
});

/**
 * GET
 * AUTH - logout
 * clears the token cookie
 */

router.get("/logout", async (req, res, next) => {
    try {
        req.session.destroy(() => {
            res.clearCookie("token");

            return res.status(200).json({
                success: true,
                message: "logged out successfully"
            });
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
