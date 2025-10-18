require('dotenv').config();

function auth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token || token !== process.env.SECRET_TOKEN) {
    return res.status(401).json({ message: "Authorization header missing or incorrect" });
  }

  next();
}

module.exports = auth;
