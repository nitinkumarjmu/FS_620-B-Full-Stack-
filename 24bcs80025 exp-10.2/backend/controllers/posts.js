const Post = require('../models/Post');
const User = require('../models/User');
exports.getPosts = async (req,res)=>{
  const posts = await Post.find().sort({ createdAt: -1 }).lean();
  res.json(posts);
};

exports.createPost = async (req,res)=>{
  const { title, content } = req.body;
  const post = await Post.create({ title, content, userId: req.userId });
  // populate user for emission
  const user = await User.findById(req.userId).select('-password');
  const payload = { ...post.toObject(), userId: post.userId, createdAt: post.createdAt };
  req.io.emit('newPost', { ...payload, _id: post._id });
  res.json(post);
};

exports.updatePost = async (req,res)=>{
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: 'Not found' });
  if (post.userId.toString() !== req.userId) return res.status(403).json({ message: 'Not allowed' });
  post.title = req.body.title; post.content = req.body.content; post.updatedAt = new Date();
  await post.save();
  res.json(post);
};

exports.deletePost = async (req,res)=>{
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: 'Not found' });
  if (post.userId.toString() !== req.userId) return res.status(403).json({ message: 'Not allowed' });
  await post.remove();
  req.io.emit('deletePost', req.params.id);
  res.json({ success: true });
};