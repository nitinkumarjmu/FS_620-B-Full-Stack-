const jwt = require('jsonwebtoken');
exports.authMiddleware = (req,res,next)=>{
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ message: 'No token' });
  const token = auth.split(' ')[1];
  try{
    const data = jwt.verify(token, process.env.JWT_SECRET || 'dev');
    req.userId = data.id;
    next();
  }catch(e){ return res.status(401).json({ message: 'Invalid token' }); }
};