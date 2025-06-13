const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const { Server } = require('socket.io');
const formRoutes = require('./routes/formRoutes');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());
app.use('/api/forms', formRoutes);

mongoose.connect(process.env.MONGO_URI, () => console.log('MongoDB connected'));

io.on('connection', (socket) => {
  socket.on('join-form', (code) => {
    socket.join(code);
  });

  socket.on('field-update', ({ code, updates }) => {
    socket.to(code).emit('field-update', updates);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on ${PORT}`));
