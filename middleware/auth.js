const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  if (req.path === "/user/login" || req.path === "/user/register") {
    return next();
  }

  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    return res.status(401).json({ message: "No token provided" });
  }

  jwt.verify(token, "VbhxvsSEON", (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }

    req.user = user;
    next();
  });
};

module.exports = authenticateToken;
