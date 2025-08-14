# Better Auth Messages

A modern, real-time messaging application built with Next.js 15, demonstrating secure authentication, real-time communication, and modern web development practices.

## 🚀 Features

- **Secure Authentication** - Powered by Better-auth with email/password support
- **Real-time Messaging** - Instant message delivery using WebSockets (Socket.IO)
- **Persistent Conversations** - All messages and conversations stored in database
- **User Discovery** - Start conversations with any user by email address
- **Modern UI** - Beautiful, responsive interface built with Tailwind CSS and Shadcn UI
- **Type Safety** - Full TypeScript implementation throughout the stack
- **Data Management** - Efficient caching and state management with TanStack React Query
- **Toast Notifications** - User-friendly feedback with Sonner notifications

## 🏗️ Architecture

This application follows a modern full-stack architecture:

```
┌─────────────────────────────────────────────────┐
│                  Frontend                        │
│  Next.js 15 + TypeScript + React Query         │
│  Tailwind CSS + Shadcn UI Components           │
│  Socket.IO Client for Real-time Updates        │
└─────────────────────────────────────────────────┘
                         │
                    HTTP + WebSocket
                         │
┌─────────────────────────────────────────────────┐
│                   Backend                       │
│  Next.js API Routes + Better Auth              │
│  Socket.IO Server + Prisma ORM                 │
│  SQLite Database                                │
└─────────────────────────────────────────────────┘
```

## 🛠️ Technology Stack

### Frontend

- **[Next.js 15](https://nextjs.org/)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety and developer experience
- **[TanStack React Query](https://tanstack.com/query/latest)** - Data fetching, caching, and synchronization
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Shadcn UI](https://ui.shadcn.com/)** - Modern, accessible React components
- **[Socket.IO Client](https://socket.io/)** - Real-time bidirectional communication
- **[Sonner](https://sonner.emilkowal.ski/)** - Beautiful toast notifications
- **[Lucide React](https://lucide.dev/)** - Clean, customizable icons

### Backend

- **[Better Auth](https://www.better-auth.com/)** - Modern authentication library
- **[Prisma ORM](https://www.prisma.io/)** - Type-safe database toolkit
- **[Socket.IO Server](https://socket.io/)** - Real-time server implementation
- **[SQLite](https://www.sqlite.org/)** - Lightweight, serverless database
- **Next.js API Routes** - Server-side API endpoints

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   └── conversations/ # Message and conversation endpoints
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # User dashboard
│   ├── messages/          # Messaging interface
│   └── page.tsx           # Landing page
├── components/            # React components
│   ├── ui/               # Shadcn UI components
│   ├── ConversationList.tsx
│   └── ChatRoom.tsx
├── hooks/                 # Custom React hooks
│   ├── useSocket.ts      # Socket.IO hooks
│   └── useQueries.ts     # React Query hooks
├── lib/                  # Utility functions
│   ├── auth.ts           # Better Auth configuration
│   ├── auth-client.ts    # Client-side auth utilities
│   ├── prisma.ts             # Database connection
│   └── utils.ts          # General utilities
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Configure the following variables:

   ```env
   BETTER_AUTH_SECRET=your-secret-key
   BETTER_AUTH_URL=http://localhost:3000
   DATABASE_URL="file:./dev.db"
   ```

4. **Initialize the database**

   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Start the development server**

   ```bash
   pnpm dev
   ```

6. **Open the application**
   Visit [http://localhost:3000](http://localhost:3000) in your browser

## 💡 Usage

### Authentication

1. Visit the application homepage
2. Click "Sign Up / Sign In" for new users
3. Create an account with email and password
4. Access the dashboard upon successful authentication

### Messaging

1. Navigate to the Messages page
2. Start a new conversation by entering another user's email
3. Send and receive messages in real-time
4. All conversations persist across sessions

### Features Demo

- **Real-time Updates**: Open the app in multiple browser windows to see live message synchronization
- **Persistence**: Refresh the page to verify messages are saved to the database
- **User Discovery**: Create multiple test accounts to experience multi-user messaging

## 🔧 Development

### Database Management

```bash
# Apply database migrations
npx prisma migrate dev

# Reset database (development only)
npx prisma migrate reset

# View database in Prisma Studio
npx prisma studio
```

### Code Quality

```bash
# Type checking
pnpm type-check

# Linting
pnpm lint

# Formatting
pnpm format
```

### Building for Production

```bash
pnpm build
pnpm start
```

## 📊 Key Features Implementation

### Real-time Messaging

- **WebSocket Connection**: Persistent connection using Socket.IO
- **Message Broadcasting**: Instant delivery to all conversation participants
- **Database Sync**: Messages saved to database alongside real-time delivery

### Authentication Flow

- **Secure Sessions**: Better Auth handles session management
- **Protected Routes**: Authentication checks on sensitive pages
- **User Context**: Global authentication state management

### Data Management

- **React Query**: Efficient data fetching with automatic caching
- **Optimistic Updates**: Immediate UI updates for better UX

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy with automatic builds on git push

### Manual Deployment

1. Build the application: `pnpm build`
2. Set up production database
3. Configure environment variables
4. Deploy to your preferred hosting platform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 🔗 Links

- [Next.js Documentation](https://nextjs.org/docs)
- [Better Auth Documentation](https://www.better-auth.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Socket.IO Documentation](https://socket.io/docs)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
