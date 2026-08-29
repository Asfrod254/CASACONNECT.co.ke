const jwt = require("jsonwebtoken");

const signToken = (user, expiresIn = "7d") =>
  jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET || "casaconnect-dev-secret",
    { expiresIn }
  );

module.exports = {
  signToken,
};
