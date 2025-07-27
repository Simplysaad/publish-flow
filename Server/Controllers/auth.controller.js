const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../Models/user.model.js");
const authMiddleware = require("../Utils/auth.middleware.js");


exports.postRegister = async (req, res, next) => {
  try {
    const { password, emailAddress } = req.body;
    // const { bio, phoneNumber, socials } = req.body;
    //socials = { name: "instagram", url: "https://instagram.com/" };

    const existingUser = await User.findOne({ emailAddress }).select(
      "_id roles emailAddress"
    );
    let hashedPassword = await bcrypt.hash(password, 10);
    let newUser;
    if (!existingUser) {
      newUser = new User({
          // roles: ["author"],
        ...req.body,
        password: hashedPassword,
      });

      await newUser.save();

      const token = jwt.sign({ userId: newUser._id }, process.env.SECRET_KEY, {
        expiresIn: "1h",
      });

      req.session.userId = newUser._id;

      res.cookie("token", token, { httpOnly: true });

      return res.status(201).json({
        success: true,
        message: "new user created successfully",
        newUser,
        token,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "user already exists",
      });
    }

    //send welcome email, use nodemailer
  } catch (err) {
    next(err);
  }
}

exports.postLogin = async (req, res, next) => {
  try {
    const { emailAddress, password } = req.body;

    const currentUser = await User.findOne({
      emailAddress,
    });

    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: "user not found",
      });
    }

    const isMatch = await bcrypt.compare(password, currentUser.password);
    if (!isMatch) {
      return res.status(403).json({
        success: false,
        message: "invalid credentials",
      });
    }
    req.session.userId = currentUser._id;

    const token = jwt.sign(
      { userId: currentUser._id },
      process.env.SECRET_KEY,
      {
        expiresIn: "1h",
      }
    );
    res.cookie("token", token, { httpOnly: true });
    return res.status(200).json({
        success: true,
        message: "user logged in successfully",
        currentUser
    });

  } catch (error) {
    next(error);
  }
}

exports.postForgotPassword = async (req, res, next) => {
  try {
    let { emailAddress } = req.body;

    let existingUser = await User.findOne({ emailAddress }).select(
      "emailAddress _id"
    );

    if (!existingUser) {
      return res.status(400).json({
        success: false,
        message: "user does not exist",
        //Do not add this message, for security purposes
      });
    }

    // createToken and send
    let { _id: userId } = existingUser;

    let token = jwt.sign({ userId }, process.env.SECRET_KEY, {
      expiresIn: "20m",
    });

    //send reset password link via email, use nodemailer

    return res.status(200).json({
      success: true,
      message: "this token is valid.for only 20 minutes",
      token,
      //,url: `http://localhost:3000/reset-password?t=${token}`
    });
  } catch (err) {
    next(err);
  }
}

exports.getResetPassword = async (req, res, next) => {
  try {
    let { t: token = null } = req.query;

    let decoded = jwt.verify(token, process.env.SECRET_KEY);

    if (!token) {
      return res.status(403).json({
        success: false,
        message: "invalid token",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "token verified successfully, redirecting to reset password page",
      decoded,
    });
  } catch (err) {
    next(err);
  }
}

exports.postResetPassword = async (req, res, next) => {
  try {
    let { t: token = null } = req.query;
    let { password } = req.body;

    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const { userId } = decoded;

    if (!decoded) {
      return res.status(403).json({
        success: false,
        message: "invalid token",
      });
    }

    let hashedPassword = await bcrypt.hash(password, 10);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          password: hashedPassword,
        },
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(201).json({
        success: false,
        message: "user not found, so password could not be changed",
      });
    }

    //send notification email to notify of password change, use nodemailer

    return res.status(201).json({
      success: true,
      message: "password changed successfully",
    });
  } catch (err) {
    next(err);
  }
}


exports.getLogout = async (req, res, next) => {
  try {
    req.session.destroy(() => {
      res.clearCookie("token");

      return res.status(200).json({
        success: true,
        message: "logged out successfully",
      });
    });
  } catch (err) {
    next(err);
  }
};

exports.postSubscribe = async (req, res, next) => {
  try {
    const { emailAddress } = req.body;
    const [name] = emailAddress.split("@");

    const updatedUser = await User.findOneAndUpdate(
      { emailAddress },
      {
        $setOnInsert: { name },
        $addToSet: { roles: "subscriber" },
      },
      {
        upsert: true,
        new: true,
      }
    );

    //send welcome email, use nodemailer

    return res.status(201).json({
      success: true,
      message: "new subscriber added",
    });
  } catch (err) {
    next(err);
  }
};