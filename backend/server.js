const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const Message = require('./models/Message');

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'https://skill-exchange-jet-zeta.vercel.app'],
    methods: ['GET', 'POST']
  }
});

app.use(cors({
  origin: ['http://localhost:5173', 'https://skill-exchange-jet-zeta.vercel.app'],
}));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/swap', require('./routes/swapRoutes'));
app.use('/api/rating', require('./routes/ratingRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));

app.get('/', (req, res) => res.send('Skill Exchange API Running'));

// Socket.io
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_room', (swapId) => {
    socket.join(swapId);
    console.log(`User joined room: ${swapId}`);
  });

  socket.on('send_message', async (data) => {
    try {
      const message = await Message.create({
        swapRequest: data.swapId,
        sender: data.senderId,
        text: data.text || '',
        fileUrl: data.fileUrl || undefined,
        fileName: data.fileName || undefined,
        fileType: data.fileType || undefined,
      });
      const populated = await message.populate('sender', 'name');
      io.to(data.swapId).emit('receive_message', populated);
    } catch (err) {
      console.error('Message error:', err.message);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
