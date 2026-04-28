import { Server } from 'socket.io';

let io: Server | null = null;

export const initSocket = (server: any) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('🔌 Client connected to socket:', socket.id);
    
    socket.on('disconnect', () => {
      console.log('🔌 Client disconnected from socket');
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

export const emitActivity = (type: 'login' | 'booking', data: any) => {
  if (io) {
    io.emit('activity', { type, data, timestamp: new Date() });
  }
};
