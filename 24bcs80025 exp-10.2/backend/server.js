require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const { Server } = require('socket.io');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const postRoutes = require('./routes/posts');
const commentRoutes = require('./routes/comments');
const connectDB = require('./config/db');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

// attach io to request so controllers can emit
app.use((req,res,next)=>{ req.io = io; next(); });

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);

const PORT = process.env.PORT || 5000;
connectDB().then(()=> {
  server.listen(PORT, ()=> console.log('Server running on', PORT));
}).catch(err=> console.error(err));

// socket connection log
io.on('connection', (socket)=>{
  console.log('socket connected', socket.id);
  socket.on('disconnect', ()=> console.log('socket disconnected', socket.id));
});