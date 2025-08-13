import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Get the current user session
    const session = await auth.api.getSession({
      headers: request.headers as any,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all conversations for the current user
    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            id: session.user.id,
          },
        },
      },
      include: {
        participants: {
          where: {
            id: {
              not: session.user.id, // Get the other participant
            },
          },
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            messages: {
              where: {
                senderId: {
                  not: session.user.id,
                },
                isRead: false,
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // Transform conversations to the expected format
    const formattedConversations = conversations.map((conv) => {
      const otherParticipant = conv.participants[0];
      const lastMessage = conv.messages[0];

      return {
        id: conv.id,
        participantId: otherParticipant?.id || '',
        participantName: otherParticipant?.name || 'Unknown User',
        participantEmail: otherParticipant?.email || '',
        lastMessage: lastMessage?.content || undefined,
        lastMessageTime: lastMessage?.createdAt.toISOString() || undefined,
        unreadCount: conv._count.messages,
        createdAt: conv.createdAt.toISOString(),
        updatedAt: conv.updatedAt.toISOString(),
      };
    });

    return NextResponse.json({ conversations: formattedConversations });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers as any,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { participantEmail } = await request.json();

    if (!participantEmail) {
      return NextResponse.json(
        { error: 'Participant email is required' },
        { status: 400 }
      );
    }

    // Find the other user by email
    const otherUser = await prisma.user.findUnique({
      where: { email: participantEmail },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (!otherUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (otherUser.id === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot create conversation with yourself' },
        { status: 400 }
      );
    }

    // Check if conversation already exists between these users
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          {
            participants: {
              some: {
                id: session.user.id,
              },
            },
          },
          {
            participants: {
              some: {
                id: otherUser.id,
              },
            },
          },
        ],
      },
      include: {
        participants: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (existingConversation) {
      // Return existing conversation
      const otherParticipant = existingConversation.participants.find(
        (p) => p.id !== session.user.id
      );

      return NextResponse.json({
        conversation: {
          id: existingConversation.id,
          participantId: otherParticipant?.id || '',
          participantName: otherParticipant?.name || 'Unknown User',
          participantEmail: otherParticipant?.email || '',
          lastMessage: undefined,
          lastMessageTime: undefined,
          unreadCount: 0,
          createdAt: existingConversation.createdAt.toISOString(),
          updatedAt: existingConversation.updatedAt.toISOString(),
        },
      });
    }

    // Create new conversation
    const newConversation = await prisma.conversation.create({
      data: {
        participants: {
          connect: [{ id: session.user.id }, { id: otherUser.id }],
        },
      },
      include: {
        participants: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    const otherParticipant = newConversation.participants.find(
      (p) => p.id !== session.user.id
    );

    return NextResponse.json(
      {
        conversation: {
          id: newConversation.id,
          participantId: otherParticipant?.id || '',
          participantName: otherParticipant?.name || 'Unknown User',
          participantEmail: otherParticipant?.email || '',
          lastMessage: undefined,
          lastMessageTime: undefined,
          unreadCount: 0,
          createdAt: newConversation.createdAt.toISOString(),
          updatedAt: newConversation.updatedAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    );
  }
}
