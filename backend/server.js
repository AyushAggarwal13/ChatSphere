require('dotenv').config();
const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const messageRoutes = require('./routes/messageRoutes');
const userRoutes = require('./routes/userRoutes');

connectDB(process.env.MONGO_URI);
const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL ?? '*' }));
app.use(express.json());
// serve uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/users', userRoutes);

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: process.env.FRONTEND_URL ?? '*', methods: ['GET','POST'] } });

const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log('socket connected:', socket.id);

  socket.on('setup', (userId) => {
    const entries = onlineUsers.get(userId) || [];
    entries.push(socket.id);
    onlineUsers.set(userId, entries);
    socket.join(userId);
    socket.emit('connected');
    console.log('User setup:', userId);
  });

  socket.on('join chat', (chatId) => socket.join(chatId));

  socket.on('typing', (chatId) => socket.to(chatId).emit('typing', chatId));
  socket.on('stop typing', (chatId) => socket.to(chatId).emit('stop typing', chatId));

  socket.on('new message', (message) => {
    const chat = message.chat;
    if (!chat?.users) return;
    chat.users.forEach(user => {
      const uid = typeof user === 'string' ? user : user._id;
      socket.to(uid.toString()).emit('message received', message);
    });
    // broadcast to chat room as well
    if (chat._id) socket.to(chat._id).emit('message received', message);
  });

  socket.on('disconnect', () => {
    for (let [userId, sockets] of onlineUsers.entries()) {
      const filtered = sockets.filter(sid => sid !== socket.id);
      if (filtered.length === 0) onlineUsers.delete(userId);
      else onlineUsers.set(userId, filtered);
    }
    console.log('socket disconnected', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
