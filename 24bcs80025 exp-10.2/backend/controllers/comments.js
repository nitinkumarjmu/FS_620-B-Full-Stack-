const Comment = require('../models/Comment');
const User = require('../models/User');
exports.getComments = async (req,res)=>{
  const comments = await Comment.find().sort({ createdAt: 1 }).lean();
  res.json(comments);
};

exports.createComment = async (req,res)=>{
  const { postId, text } = req.body;
  const comment = await Comment.create({ postId, userId: req.userId, text });
  const payload = { ...comment.toObject() };
  req.io.emit('newComment', payload);
  res.json(comment);
};

exports.deleteComment = async (req,res)=>{
  const comment = await Comment.findById(req.params.id);
  if (!comment) return res.status(404).json({ message: 'Not found' });
  if (comment.userId.toString() !== req.userId) return res.status(403).json({ message: 'Not allowed' });
  await comment.remove();
  req.io.emit('deleteComment', req.params.id);
  res.json({ success: true });
};