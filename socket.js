const Message = require('./models/message');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('New user connected');

    socket.on('join', ({ username, category }) => {
      socket.username = username;
      socket.category = category;

      console.log(`${username} joined category: ${category}`);
      socket.emit('joined', { success: true });
    });

    socket.on('joinRoom', (room) => {
      socket.join(room);
      console.log(`${socket.username} joined room: ${room}`);
    });

    socket.on('sendMessage', async ({ room, message }) => {
      const newMessage = new Message({
        room,
        username: socket.username,
        text: message,
        timestamp: new Date(),
      });

      await newMessage.save();

      // Broadcast to all users in the room (including sender)
      io.to(room).emit('message', { room, message: newMessage });
    });

    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });
};
