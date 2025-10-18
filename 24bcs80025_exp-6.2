const express = require("express");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

const SECRET_KEY = "mysecretkey";
let balance = 1000;

// 🧱 LOGIN ROUTE
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username === "user1" && password === "password123") {
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "1h" });
    return res.json({ token });
  }
  return res.status(401).json({ message: "Invalid username or password" });
});

// 🧩 VERIFY TOKEN MIDDLEWARE
function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(403).json({ message: "Invalid or expired token" });

  const token = authHeader.split(" ")[1];
  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid or expired token" });
    req.user = user;
    next();
  });
}

// 💰 BALANCE ROUTE
app.get("/balance", verifyToken, (req, res) => {
  res.json({ balance });
});

// 💵 DEPOSIT ROUTE
app.post("/deposit", verifyToken, (req, res) => {
  const { amount } = req.body;
  balance += amount;
  res.json({ message: `Deposited $${amount}`, newBalance: balance });
});

// 💸 WITHDRAW ROUTE
app.post("/withdraw", verifyToken, (req, res) => {
  const { amount } = req.body;
  if (amount > balance)
    return res.status(400).json({ message: "Insufficient balance" });
  balance -= amount;
  res.json({ message: `Withdrew $${amount}`, newBalance: balance });
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
