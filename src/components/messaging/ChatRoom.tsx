import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Send, Users, Loader2 } from 'lucide-react'
import { useSocket } from '@/hooks/useSocket'
import { useSession } from '@/lib/auth-client'
import { useMessages, useSendMessage, useAddMessageToCache } from '@/hooks/useQueries'
import { toast } from 'sonner'

interface Message {
  id: string
  content: string
  senderId: string
  senderName: string
  senderEmail: string
  createdAt: string
  isRead: boolean
  readAt?: string
  conversationId: string
}

interface ChatRoomProps {
  conversationId: string
  receiverId: string
  receiverName: string
}

export default function ChatRoom({
  conversationId,
  receiverId,
  receiverName,
}: ChatRoomProps) {
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
  
  // Use React Query hooks
  const { data: messages = [], isLoading, error } = useMessages(conversationId);
  const sendMessageMutation = useSendMessage(conversationId);
  const addMessageToCache = useAddMessageToCache();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (socket && isConnected) {
      joinConversation(conversationId);

      // Listen for new messages from other users
      socket.on('receive-message', (message: any) => {
        // Add message to React Query cache
        addMessageToCache({
          id: message.id,
          content: message.content,
          senderId: message.senderId,
          senderName: message.senderName,
          senderEmail: message.senderEmail || '',
          createdAt: message.createdAt,
          isRead: message.isRead,
          readAt: message.readAt,
          conversationId: conversationId,
        });
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
  }, [socket, isConnected, conversationId, addMessageToCache, joinConversation, leaveConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || !session?.user) return;

    try {
      // Send via database first
      const savedMessage = await sendMessageMutation.mutateAsync(newMessage);

      // Then send via socket for real-time updates to other users
      sendMessage(conversationId, newMessage, receiverId);

      setNewMessage('');
      stopTyping(conversationId);
      setIsTyping(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to send message');
    }
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

  if (isLoading) {
    return (
      <Card className="flex-1 flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Chat with {receiverName}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="flex items-center">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Loading messages...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="flex-1 flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Chat with {receiverName}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-red-600 text-center">
            Failed to load messages
          </div>
        </CardContent>
      </Card>
    );
  }

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
                disabled={!newMessage.trim() || !isConnected || sendMessageMutation.isPending}
              >
                {sendMessageMutation.isPending ? (
                  <Loader2 className='w-4 h-4 animate-spin' />
                ) : (
                  <Send className='w-4 h-4' />
                )}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
