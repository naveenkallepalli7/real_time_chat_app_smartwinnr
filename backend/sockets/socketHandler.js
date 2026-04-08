const socketToUser = new Map();
const onlineUsers = new Set();

const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log('--- Socket Connected ---');
    console.log('Socket ID:', socket.id);
    
    // Send current list to anyone who just connected
    socket.emit('online users', Array.from(onlineUsers));

    socket.on('setup', (userData) => {
      if (!userData || !userData._id) {
        console.log('Setup Failed: No UserData or ID');
        return;
      }
      const userId = userData._id.toString();
      
      socket.join(userId);
      socketToUser.set(socket.id, userId);
      onlineUsers.add(userId);
      
      const currentOnline = Array.from(onlineUsers);
      console.log('User Registered:', userId);
      console.log('Total Online:', currentOnline);
      
      // Notify EVERYONE including sender
      io.emit('online users', currentOnline);
      socket.emit('connected');
    });

    socket.on('join chat', (room) => {
      socket.join(room);
    });

    socket.on('new message', (newMessageReceived) => {
      var chat = newMessageReceived.room;
      if (!chat.participants) return;
      chat.participants.forEach((user) => {
        if (user._id.toString() === newMessageReceived.sender._id.toString()) return;
        socket.in(user._id.toString()).emit('message received', newMessageReceived);
      });
    });

    socket.on('disconnect', () => {
      const userId = socketToUser.get(socket.id);
      if (userId) {
        socketToUser.delete(socket.id);
        
        // Check if user still has other tabs/sockets open
        let stillOnline = false;
        for (const uid of socketToUser.values()) {
          if (uid === userId) {
            stillOnline = true;
            break;
          }
        }
        
        if (!stillOnline) {
          onlineUsers.delete(userId);
          console.log('User Offline:', userId, 'Total Online:', onlineUsers.size);
          io.emit('online users', Array.from(onlineUsers));
        }
      }
      console.log('Socket Disconnected:', socket.id);
    });
  });
};

module.exports = socketHandler;
