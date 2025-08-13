import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from '@/lib/auth-client'

interface Conversation {
  id: string
  participantId: string
  participantName: string
  participantEmail: string
  lastMessage?: string
  lastMessageTime?: string
  unreadCount?: number
  createdAt: string
  updatedAt: string
}

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

// Conversations hooks
export const useConversations = () => {
  const { data: session } = useSession()
  
  return useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const response = await fetch('/api/conversations')
      if (!response.ok) {
        throw new Error('Failed to fetch conversations')
      }
      const data = await response.json()
      return data.conversations as Conversation[]
    },
    enabled: !!session?.user,
  })
}

export const useCreateConversation = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (participantEmail: string) => {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ participantEmail }),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create conversation')
      }
      
      const data = await response.json()
      return data.conversation as Conversation
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })
}

// Messages hooks
export const useMessages = (conversationId: string) => {
  const { data: session } = useSession()
  
  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      const response = await fetch(`/api/conversations/${conversationId}/messages`)
      if (!response.ok) {
        throw new Error('Failed to fetch messages')
      }
      const data = await response.json()
      return data.messages as Message[]
    },
    enabled: !!session?.user && !!conversationId,
    refetchInterval: 5000, // Refetch every 5 seconds as backup to real-time updates
  })
}

export const useSendMessage = (conversationId: string) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (content: string) => {
      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to send message')
      }
      
      const data = await response.json()
      return data.message as Message
    },
    onSuccess: (newMessage) => {
      // Add the new message to the cache
      queryClient.setQueryData(['messages', conversationId], (oldMessages: Message[] = []) => {
        // Check if message already exists (avoid duplicates)
        const exists = oldMessages.find(msg => msg.id === newMessage.id)
        if (exists) return oldMessages
        
        return [...oldMessages, newMessage]
      })
      
      // Update conversations list with new last message
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })
}

// Real-time message updates
export const useAddMessageToCache = () => {
  const queryClient = useQueryClient()
  
  return (message: Message) => {
    queryClient.setQueryData(['messages', message.conversationId], (oldMessages: Message[] = []) => {
      // Check if message already exists (avoid duplicates from real-time updates)
      const exists = oldMessages.find(msg => msg.id === message.id)
      if (exists) return oldMessages
      
      return [...oldMessages, message]
    })
    
    // Update conversations list
    queryClient.invalidateQueries({ queryKey: ['conversations'] })
  }
}
