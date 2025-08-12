import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Search, Plus } from 'lucide-react';

interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantEmail: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
}

interface ConversationListProps {
  onSelectConversation: (conversation: Conversation) => void;
  selectedConversationId?: string;
}

export default function ConversationList({
  onSelectConversation,
  selectedConversationId,
}: ConversationListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [newChatEmail, setNewChatEmail] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);

  // Mock conversations for now - in a real app, this would come from an API
  useEffect(() => {
    // Simulated conversations
    const mockConversations: Conversation[] = [
      {
        id: 'conv_1',
        participantId: 'user_2',
        participantName: 'Alice Johnson',
        participantEmail: 'alice@example.com',
        lastMessage: 'Hey, how are you doing?',
        lastMessageTime: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
        unreadCount: 2,
      },
      {
        id: 'conv_2',
        participantId: 'user_3',
        participantName: 'Bob Smith',
        participantEmail: 'bob@example.com',
        lastMessage: 'Thanks for the help earlier!',
        lastMessageTime: new Date(
          Date.now() - 1000 * 60 * 60 * 2
        ).toISOString(), // 2 hours ago
        unreadCount: 0,
      },
      {
        id: 'conv_3',
        participantId: 'user_4',
        participantName: 'Carol Williams',
        participantEmail: 'carol@example.com',
        lastMessage: 'See you tomorrow!',
        lastMessageTime: new Date(
          Date.now() - 1000 * 60 * 60 * 24
        ).toISOString(), // 1 day ago
        unreadCount: 1,
      },
    ];

    setConversations(mockConversations);
  }, []);

  const handleNewChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatEmail.trim()) return;

    // Create a new conversation
    const newConversation: Conversation = {
      id: `conv_${Date.now()}`,
      participantId: `user_${Date.now()}`,
      participantName: newChatEmail.split('@')[0], // Simple name from email
      participantEmail: newChatEmail,
      lastMessage: undefined,
      lastMessageTime: undefined,
      unreadCount: 0,
    };

    setConversations((prev) => [newConversation, ...prev]);
    setNewChatEmail('');
    setShowNewChat(false);
    onSelectConversation(newConversation);
  };

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.participantEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = (now.getTime() - date.getTime()) / 1000;
    const diffInMinutes = diffInSeconds / 60;
    const diffInHours = diffInMinutes / 60;
    const diffInDays = diffInHours / 24;

    if (diffInMinutes < 1) return 'now';
    if (diffInMinutes < 60) return `${Math.floor(diffInMinutes)}m`;
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h`;
    if (diffInDays < 7) return `${Math.floor(diffInDays)}d`;
    return date.toLocaleDateString();
  };

  return (
    <Card className='h-full'>
      <CardHeader>
        <CardTitle className='flex items-center justify-between'>
          <span className='flex items-center gap-2'>
            <MessageCircle className='w-5 h-5' />
            Messages
          </span>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setShowNewChat(!showNewChat)}
          >
            <Plus className='w-4 h-4' />
          </Button>
        </CardTitle>

        <div className='space-y-2'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4' />
            <Input
              placeholder='Search conversations...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='pl-9'
            />
          </div>

          {showNewChat && (
            <form onSubmit={handleNewChat} className='space-y-2'>
              <Input
                placeholder='Enter email to start new chat...'
                value={newChatEmail}
                onChange={(e) => setNewChatEmail(e.target.value)}
                type='email'
              />
              <div className='flex gap-2'>
                <Button type='submit' size='sm' className='flex-1'>
                  Start Chat
                </Button>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() => setShowNewChat(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>
      </CardHeader>

      <CardContent className='p-0'>
        <div className='space-y-1'>
          {filteredConversations.length === 0 ? (
            <div className='p-4 text-center text-muted-foreground'>
              {searchQuery ? 'No conversations found' : 'No conversations yet'}
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => onSelectConversation(conversation)}
                className={`w-full text-left p-4 hover:bg-muted transition-colors border-b border-border last:border-b-0 ${
                  selectedConversationId === conversation.id ? 'bg-muted' : ''
                }`}
              >
                <div className='flex items-start justify-between'>
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center gap-2'>
                      <div className='font-medium truncate'>
                        {conversation.participantName}
                      </div>
                      {conversation.unreadCount &&
                        conversation.unreadCount > 0 && (
                          <Badge variant='default' className='text-xs'>
                            {conversation.unreadCount}
                          </Badge>
                        )}
                    </div>
                    <div className='text-sm text-muted-foreground truncate'>
                      {conversation.participantEmail}
                    </div>
                    {conversation.lastMessage && (
                      <div className='text-sm text-muted-foreground truncate mt-1'>
                        {conversation.lastMessage}
                      </div>
                    )}
                  </div>
                  {conversation.lastMessageTime && (
                    <div className='text-xs text-muted-foreground ml-2'>
                      {formatTime(conversation.lastMessageTime)}
                    </div>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
