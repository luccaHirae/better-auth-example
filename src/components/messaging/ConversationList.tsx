import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Search, Plus, Loader2 } from 'lucide-react';
import { useConversations, useCreateConversation } from '@/hooks/useQueries';
import { toast } from 'sonner';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [newChatEmail, setNewChatEmail] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);

  // Use React Query hooks
  const { data: conversations = [], isLoading, error } = useConversations();
  const createConversationMutation = useCreateConversation();

  const handleNewChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatEmail.trim()) return;

    try {
      const newConversation = await createConversationMutation.mutateAsync(
        newChatEmail
      );
      setNewChatEmail('');
      setShowNewChat(false);
      onSelectConversation(newConversation);
      toast.success('Conversation created successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create conversation');
    }
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
                <Button
                  type='submit'
                  size='sm'
                  className='flex-1'
                  disabled={createConversationMutation.isPending}
                >
                  {createConversationMutation.isPending ? (
                    <>
                      <Loader2 className='w-4 h-4 animate-spin mr-2' />
                      Creating...
                    </>
                  ) : (
                    'Start Chat'
                  )}
                </Button>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() => setShowNewChat(false)}
                  disabled={createConversationMutation.isPending}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>
      </CardHeader>

      <CardContent className='p-0'>
        {isLoading ? (
          <div className='p-4 flex items-center justify-center'>
            <Loader2 className='w-6 h-6 animate-spin' />
            <span className='ml-2'>Loading conversations...</span>
          </div>
        ) : error ? (
          <div className='p-4 text-center text-red-600'>
            Failed to load conversations
          </div>
        ) : (
          <div className='space-y-1'>
            {filteredConversations.length === 0 ? (
              <div className='p-4 text-center text-muted-foreground'>
                {searchQuery
                  ? 'No conversations found'
                  : 'No conversations yet'}
                {!searchQuery && (
                  <div className='mt-2 text-sm'>
                    Click the + button to start a new conversation
                  </div>
                )}
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
        )}
      </CardContent>
    </Card>
  );
}
