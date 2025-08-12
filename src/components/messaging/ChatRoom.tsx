import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Send, Users } from 'lucide-react';
import { useSocket } from '@/hooks/useSocket';
import { useSession } from '@/lib/auth-client';

interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  senderName: string;
  createdAt: string;
  isRead: boolean;
}

interface ChatRoomProps {
  conversationId: string;
  receiverId: string;
  receiverName: string;
}

export default function ChatRoom({
  conversationId,
  receiverId,
  receiverName,
}: ChatRoomProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    socket,
    isConnected,
    sendMessage,
    joinConversation,
    leaveConversation,
    startTyping,
    stopTyping,
  } = useSocket();
  const { data: session } = useSession();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (socket && isConnected) {
      joinConversation(conversationId);

      // Listen for new messages
      socket.on('receive-message', (message: Message) => {
        setMessages((prev) => [...prev, message]);
      });

      // Listen for message confirmations
      socket.on('message-confirmed', ({ messageId }) => {
        console.log('Message confirmed:', messageId);
      });

      // Listen for typing indicators
      socket.on('user-typing', ({ userName }) => {
        setTypingUser(userName);
      });

      socket.on('user-stopped-typing', () => {
        setTypingUser(null);
      });

      return () => {
        socket.off('receive-message');
        socket.off('message-confirmed');
        socket.off('user-typing');
        socket.off('user-stopped-typing');
        leaveConversation(conversationId);
      };
    }
  }, [socket, isConnected, conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || !session?.user) return;

    const message: Message = {
      id: `temp_${Date.now()}`,
      content: newMessage,
      senderId: session.user.id,
      receiverId,
      senderName: session.user.name,
      createdAt: new Date().toISOString(),
      isRead: false,
    };

    // Add message to local state immediately (optimistic update)
    setMessages((prev) => [...prev, message]);

    // Send via socket
    sendMessage(conversationId, newMessage, receiverId);

    setNewMessage('');
    stopTyping(conversationId);
    setIsTyping(false);
  };

  const handleTyping = (value: string) => {
    setNewMessage(value);

    if (value.trim() && !isTyping) {
      startTyping(conversationId);
      setIsTyping(true);
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping(conversationId);
      setIsTyping(false);
    }, 1000);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className='flex flex-col h-full'>
      <Card className='flex-1 flex flex-col'>
        <CardHeader className='pb-3'>
          <CardTitle className='flex items-center gap-2'>
            <Users className='w-5 h-5' />
            Chat with {receiverName}
            <Badge
              variant={isConnected ? 'default' : 'destructive'}
              className='ml-auto'
            >
              {isConnected ? 'Connected' : 'Disconnected'}
            </Badge>
          </CardTitle>
        </CardHeader>

        <CardContent className='flex-1 flex flex-col p-0'>
          <ScrollArea className='flex-1 px-4'>
            <div className='space-y-4 py-4'>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.senderId === session?.user?.id
                      ? 'justify-end'
                      : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.senderId === session?.user?.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <div className='text-sm'>{message.content}</div>
                    <div
                      className={`text-xs mt-1 ${
                        message.senderId === session?.user?.id
                          ? 'text-primary-foreground/70'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {formatTime(message.createdAt)}
                      {message.senderId === session?.user?.id && (
                        <span className='ml-1'>
                          {message.isRead ? '✓✓' : '✓'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {typingUser && (
                <div className='flex justify-start'>
                  <div className='bg-muted px-4 py-2 rounded-lg'>
                    <div className='text-sm text-muted-foreground'>
                      {typingUser} is typing...
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <div className='border-t p-4'>
            <form onSubmit={handleSendMessage} className='flex gap-2'>
              <Input
                value={newMessage}
                onChange={(e) => handleTyping(e.target.value)}
                placeholder='Type your message...'
                className='flex-1'
                disabled={!isConnected}
              />
              <Button
                type='submit'
                disabled={!newMessage.trim() || !isConnected}
              >
                <Send className='w-4 h-4' />
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
