const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.signup = async (req,res)=>{
  try{
    const { username, email, password, bio } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email exists' });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashed, bio });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'dev', { expiresIn: '7d' });
    res.json({ token });
  }catch(e){ res.status(500).json({ message: e.message }); }
};

exports.login = async (req,res)=>{
  try{
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid' });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: 'Invalid' });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'dev', { expiresIn: '7d' });
    res.json({ token });
  }catch(e){ res.status(500).json({ message: e.message }); }
};

exports.me = async (req,res)=>{
  try{
    const user = await User.findById(req.userId).select('-password');
    res.json({ user });
  }catch(e){ res.status(500).json({ message: e.message }); }
};