const User = require('./../models/user');

let auth = (req, res, next) => {
  let token = req.headers["x-access-token"];
  if (Boolean(token) == false) return res.status(401).json({ message: "Sign in to continue." });
  User.findByToken(token, (err, user) => {
    if (err) throw err;
    if (!user) return res.status(401).json({
      message: "Invalid token"
    });
    req.token = token;
    req.user = user;
    next();
  })
}

module.exports = { auth };
