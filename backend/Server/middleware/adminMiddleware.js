const jwt = require("jsonwebtoken");

const adminProtect = (req, res, next) => {
  try {
    let token;

    // token comes from header: Authorization: Bearer <token>
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // attach admin to request
    req.admin = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Token failed" });
  }
};

module.exports = adminProtect;
