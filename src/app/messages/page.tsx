'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import ConversationList from '@/components/messaging/ConversationList';
import ChatRoom from '@/components/messaging/ChatRoom';
import { MessageCircle } from 'lucide-react';

interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantEmail: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
}

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
  };

  return (
    <div className='container mx-auto p-4 h-screen'>
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-4 h-full'>
        {/* Conversations List */}
        <div className='lg:col-span-1'>
          <ConversationList
            onSelectConversation={handleSelectConversation}
            selectedConversationId={selectedConversation?.id}
          />
        </div>

        {/* Chat Area */}
        <div className='lg:col-span-2'>
          {selectedConversation ? (
            <ChatRoom
              conversationId={selectedConversation.id}
              receiverId={selectedConversation.participantId}
              receiverName={selectedConversation.participantName}
            />
          ) : (
            <Card className='h-full'>
              <CardContent className='h-full flex items-center justify-center'>
                <div className='text-center text-muted-foreground'>
                  <MessageCircle className='w-16 h-16 mx-auto mb-4 opacity-50' />
                  <h3 className='text-lg font-medium mb-2'>
                    No conversation selected
                  </h3>
                  <p>Select a conversation from the list to start messaging</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
