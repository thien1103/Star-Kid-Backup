const jwt = require("jsonwebtoken");

// Middleware to extract user from JWT
const verifyToken = (req, res, next) => {
  const token =
    req.headers.authorization && req.headers.authorization.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      status_code: 401,
      type: "error",
      message: "Access token is missing or invalid",
    });
  }

  jwt.verify(token, "jwt-secret-key", (err, user) => {
    if (err) {
      return res.status(403).json({
        status_code: 403,
        type: "error",
        message: "Invalid token",
      });
    }

    req.user = user; // Attach user information to request
    next();
  });
};

module.exports = verifyToken;
