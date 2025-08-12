import { NextApiRequest, NextApiResponse } from 'next';
import { Server as ServerIO } from 'socket.io';

const SocketHandler = (req: NextApiRequest, res: any) => {
  if (res.socket.server.io) {
    console.log('Socket is already running');
    res.end();
    return;
  }

  console.log('Socket is initializing');
  const io = new ServerIO(res.socket.server, {
    path: '/api/socketio',
    addTrailingSlash: false,
    cors: {
      origin: 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Join conversation room
    socket.on('join-conversation', (conversationId: string) => {
      socket.join(`conversation:${conversationId}`);
      console.log(`Socket ${socket.id} joined conversation: ${conversationId}`);
    });

    // Leave conversation room
    socket.on('leave-conversation', (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`);
      console.log(`Socket ${socket.id} left conversation: ${conversationId}`);
    });

    // Handle new message
    socket.on(
      'send-message',
      (messageData: {
        conversationId: string;
        content: string;
        senderId: string;
        receiverId: string;
        senderName: string;
      }) => {
        const message = {
          id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          ...messageData,
          createdAt: new Date().toISOString(),
          isRead: false,
        };

        // Emit to all users in the conversation room
        socket
          .to(`conversation:${messageData.conversationId}`)
          .emit('receive-message', message);

        // Confirm message sent to sender
        socket.emit('message-confirmed', { messageId: message.id });

        console.log(
          `Message sent in conversation ${messageData.conversationId}:`,
          message.content
        );
      }
    );

    // Handle typing indicators
    socket.on(
      'typing-start',
      (data: { conversationId: string; userName: string }) => {
        socket.to(`conversation:${data.conversationId}`).emit('user-typing', {
          userName: data.userName,
        });
      }
    );

    socket.on('typing-stop', (data: { conversationId: string }) => {
      socket
        .to(`conversation:${data.conversationId}`)
        .emit('user-stopped-typing');
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  res.socket.server.io = io;
  res.end();
};

export default SocketHandler;
