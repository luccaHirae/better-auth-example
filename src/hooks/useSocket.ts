import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSession } from '@/lib/auth-client';

interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  sendMessage: (
    conversationId: string,
    content: string,
    receiverId: string
  ) => void;
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
  startTyping: (conversationId: string) => void;
  stopTyping: (conversationId: string) => void;
}

export const useSocket = (): UseSocketReturn => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    const initSocket = async () => {
      if (!session?.user) {
        return;
      }

      // Initialize socket connection
      await fetch('/api/socketio');

      const newSocket = io({
        path: '/api/socketio',
        addTrailingSlash: false,
        forceNew: true,
      });

      newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id);
        setIsConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setIsConnected(false);
      });

      setSocket(newSocket);
    };

    initSocket();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [session?.user]);

  const sendMessage = (
    conversationId: string,
    content: string,
    receiverId: string
  ) => {
    if (socket && session?.user) {
      socket.emit('send-message', {
        conversationId,
        content,
        senderId: session.user.id,
        receiverId,
        senderName: session.user.name,
      });
    }
  };

  const joinConversation = (conversationId: string) => {
    if (socket) {
      socket.emit('join-conversation', conversationId);
    }
  };

  const leaveConversation = (conversationId: string) => {
    if (socket) {
      socket.emit('leave-conversation', conversationId);
    }
  };

  const startTyping = (conversationId: string) => {
    if (socket && session?.user) {
      socket.emit('typing-start', {
        conversationId,
        userName: session.user.name,
      });
    }
  };

  const stopTyping = (conversationId: string) => {
    if (socket) {
      socket.emit('typing-stop', { conversationId });
    }
  };

  return {
    socket,
    isConnected,
    sendMessage,
    joinConversation,
    leaveConversation,
    startTyping,
    stopTyping,
  };
};
