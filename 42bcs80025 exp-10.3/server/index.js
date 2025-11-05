const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

const JWT_SECRET = 'change_this_secret_for_prod';

// In-memory stores (demo). Replace with MongoDB/Postgres for production.
let users = [
  { id: 1, username: 'john_doe', email: 'john@example.com', passwordHash: bcrypt.hashSync('password123', 8) },
  { id: 2, username: 'jane_smith', email: 'jane@example.com', passwordHash: bcrypt.hashSync('password123', 8) }
];

let posts = [
  {
    id: 1,
    userId: 2,
    username: 'jane_smith',
    content: 'Just deployed my first AWS application! 🚀',
    image: null,
    likes: 5,
    comments: [{ id: 1, username: 'john_doe', text: 'Congrats! 🎉' }],
    createdAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 2,
    userId: 1,
    username: 'john_doe',
    content: 'Learning React is so much fun!',
    image: null,
    likes: 3,
    comments: [],
    createdAt: new Date(Date.now() - 7200000).toISOString()
  }
];

function generateToken(user) {
  return jwt.sign({ id: user.id, username: user.username, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'Missing auth header' });
  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Auth routes
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  if (!user) return res.status(400).json({ error: 'Invalid credentials' });
  const ok = bcrypt.compareSync(password, user.passwordHash);
  if (!ok) return res.status(400).json({ error: 'Invalid credentials' });
  const token = generateToken(user);
  res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
});

app.post('/api/auth/register', (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) return res.status(400).json({ error: 'Missing fields' });
  if (users.find(u => u.email === email)) return res.status(400).json({ error: 'Email already used' });
  const id = users.length + 1;
  const passwordHash = bcrypt.hashSync(password, 8);
  const newUser = { id, username, email, passwordHash };
  users.push(newUser);
  const token = generateToken(newUser);
  res.json({ token, user: { id, username, email } });
});

// Posts
app.get('/api/posts', (req, res) => {
  // return newest first
  const sorted = [...posts].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(sorted);
});

app.post('/api/posts', authMiddleware, upload.single('image'), (req, res) => {
  const { content } = req.body;
  const image = req.file ? req.file.path : null;
  const post = {
    id: posts.length + 1,
    userId: req.user.id,
    username: req.user.username,
    content: content || '',
    image,
    likes: 0,
    comments: [],
    createdAt: new Date().toISOString()
  };
  posts.unshift(post);
  res.json(post);
});

app.put('/api/posts/:id', authMiddleware, (req, res) => {
  const id = Number(req.params.id);
  const post = posts.find(p => p.id === id);
  if (!post) return res.status(404).json({ error: 'Not found' });
  if (post.userId !== req.user.id) return res.status(403).json({ error: 'Not allowed' });
  post.content = req.body.content ?? post.content;
  res.json(post);
});

app.delete('/api/posts/:id', authMiddleware, (req, res) => {
  const id = Number(req.params.id);
  const post = posts.find(p => p.id === id);
  if (!post) return res.status(404).json({ error: 'Not found' });
  if (post.userId !== req.user.id) return res.status(403).json({ error: 'Not allowed' });
  posts = posts.filter(p => p.id !== id);
  res.json({ success: true });
});

app.post('/api/posts/:id/like', authMiddleware, (req, res) => {
  const id = Number(req.params.id);
  const post = posts.find(p => p.id === id);
  if (!post) return res.status(404).json({ error: 'Not found' });
  post.likes += 1;
  res.json(post);
});

app.post('/api/posts/:id/comment', authMiddleware, (req, res) => {
  const id = Number(req.params.id);
  const post = posts.find(p => p.id === id);
  if (!post) return res.status(404).json({ error: 'Not found' });
  const comment = { id: post.comments.length + 1, username: req.user.username, text: req.body.text || '' };
  post.comments.push(comment);
  res.json(comment);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log('Server running on', PORT));
