const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', (username) => {
    socket.username = username;
    io.emit('message', {
      user: 'System',
      text: `${username} joined the chat`,
      time: new Date().toLocaleTimeString()
    });
  });

  socket.on('sendMessage', (message) => {
    io.emit('message', {
      user: socket.username,
      text: message,
      time: new Date().toLocaleTimeString()
    });
  });

  socket.on('disconnect', () => {
    if (socket.username) {
      io.emit('message', {
        user: 'System',
        text: `${socket.username} left the chat`,
        time: new Date().toLocaleTimeString()
      });
    }
    console.log('User disconnected:', socket.id);
  });
});

server.listen(4000, () => {
  console.log('Server running on http://localhost:4000');
});
