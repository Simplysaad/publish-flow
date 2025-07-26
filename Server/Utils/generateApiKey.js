const jwt = require("jsonwebtoken");

function generateApiKey(payload, secret) {
    return jwt.sign(payload, secret);
}

// const secret = process.env.SECRET_KEY; // keep this safe!
// const apiKey = generateApiKey({ userId: req.session.userId }, secret);

// console.log("Your JWT API key:", apiKey);

module.exports = generateApiKey;
