const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../Models/user.model.js");
const authMiddleware = require("../Utils/auth.middleware.js");

const authController = require("../Controllers/auth.controller.js");

/**
 * POST
 * AUTH - subscribe page
 */
router.post("/subscribe", authController.postSubscribe);

router.post("/register", authController.postRegister); // COMPLETED

router.post("/login", authController.postLogin); // COMPLETED

/**
 * GET
 * AUTH - forgot password
 * send a token and verify user
 */

router.post("/forgot-password", authController.postForgotPassword);
router.get("/reset-password", authController.getResetPassword);
router.post("/reset-password", authController.postResetPassword);

/**
 * GET
 * AUTH - logout
 * clears the token cookie
 */

router.get("/logout", authController.getLogout);

module.exports = router;
