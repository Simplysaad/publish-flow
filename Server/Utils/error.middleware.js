function errorHandler(err, req, res, next) {
    // Log the error details
    console.error("Error:", err);

    // Set status code (default to 500)
    const status = err.statusCode || err.status || 500;

    // Avoid leaking stack traces or sensitive info in production
    const response = {
        status: "error",
        success: false,
        message: err.message || "Internal Server Error"
    };

    if (err.name === "JsonWebTokenError") {
        response.message = "invalid token";
    }
    if (err.name === "TokenExpiredError") {
        response.message = "token expired";
    }

    // Optionally include stack trace in development
    if (process.env.NODE_ENV === "development") {
        response.stack = err.stack;
    }

    console.error(err);
    return res.status(status).json(response);
}

module.exports = errorHandler;
//module.exports = (err, req, res, next) => {};
