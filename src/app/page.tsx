'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  MessageCircle,
  Shield,
  Zap,
  Users,
  ArrowRight,
  Github,
} from 'lucide-react';
import { useSession } from '@/lib/auth-client';

export default function Home() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  // Show loading state while checking authentication
  if (isPending) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50'>
      <div className='container mx-auto px-4 py-16'>
        {/* Header */}
        <div className='text-center mb-16'>
          <div className='flex items-center justify-center mb-6'>
            <MessageCircle className='w-12 h-12 text-blue-600 mr-3' />
            <h1 className='text-4xl font-bold text-gray-900'>
              Better Auth Messages
            </h1>
          </div>
          <p className='text-xl text-gray-600 max-w-2xl mx-auto'>
            A modern real-time messaging application built with Next.js,
            Better-auth, and Socket.IO. Experience secure authentication and
            instant messaging with a beautiful, responsive interface.
          </p>
        </div>

        {/* Authentication Status Banner */}
        <div className='text-center mb-12'>
          {session?.user ? (
            <Card className='max-w-md mx-auto bg-green-50 border-green-200'>
              <CardHeader className='pb-3'>
                <CardTitle className='text-green-800 flex items-center justify-center'>
                  <Shield className='w-5 h-5 mr-2' />
                  Welcome back!
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='text-sm text-green-700'>
                  Signed in as <strong>{session.user.email}</strong>
                </div>
                <div className='flex gap-2'>
                  <Button
                    onClick={() => router.push('/dashboard')}
                    className='flex-1'
                  >
                    Go to Dashboard
                    <ArrowRight className='w-4 h-4 ml-2' />
                  </Button>
                  <Button
                    onClick={() => router.push('/messages')}
                    variant='outline'
                    className='flex-1'
                  >
                    <MessageCircle className='w-4 h-4 mr-2' />
                    Messages
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className='max-w-md mx-auto bg-blue-50 border-blue-200'>
              <CardHeader className='pb-3'>
                <CardTitle className='text-blue-800'>Get Started</CardTitle>
                <CardDescription className='text-blue-700'>
                  Sign up or sign in to start messaging with friends and
                  colleagues
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-3'>
                <Button
                  onClick={() => router.push('/auth')}
                  className='w-full'
                  size='lg'
                >
                  Sign Up / Sign In
                  <ArrowRight className='w-4 h-4 ml-2' />
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Features Grid */}
        <div className='grid md:grid-cols-3 gap-8 mb-16'>
          <Card className='text-center'>
            <CardHeader>
              <Shield className='w-12 h-12 text-blue-600 mx-auto mb-4' />
              <CardTitle>Secure Authentication</CardTitle>
              <CardDescription>
                Powered by Better-auth for robust, secure user authentication
                with email/password support
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className='text-center'>
            <CardHeader>
              <Zap className='w-12 h-12 text-green-600 mx-auto mb-4' />
              <CardTitle>Real-time Messaging</CardTitle>
              <CardDescription>
                Instant message delivery using WebSockets. See messages appear
                in real-time with typing indicators
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className='text-center'>
            <CardHeader>
              <Users className='w-12 h-12 text-purple-600 mx-auto mb-4' />
              <CardTitle>User Conversations</CardTitle>
              <CardDescription>
                Start conversations with any user by email. All messages are
                persisted and synchronized across devices
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Technical Details */}
        <Card className='mb-12'>
          <CardHeader>
            <CardTitle>Built with Modern Technologies</CardTitle>
            <CardDescription>
              This application demonstrates a complete full-stack messaging
              solution
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid md:grid-cols-2 gap-6'>
              <div>
                <h4 className='font-semibold mb-3 text-gray-900'>Frontend</h4>
                <ul className='space-y-1 text-sm text-gray-600'>
                  <li>• Next.js 15 with App Router</li>
                  <li>• TypeScript for type safety</li>
                  <li>• Tailwind CSS & Shadcn UI components</li>
                  <li>• TanStack React Query for data management</li>
                  <li>• Socket.IO client for real-time updates</li>
                </ul>
              </div>
              <div>
                <h4 className='font-semibold mb-3 text-gray-900'>Backend</h4>
                <ul className='space-y-1 text-sm text-gray-600'>
                  <li>• Better-auth for authentication</li>
                  <li>• Prisma ORM with SQLite database</li>
                  <li>• Socket.IO server for WebSockets</li>
                  <li>• RESTful API routes</li>
                  <li>• Real-time message persistence</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <footer className='text-center text-gray-500'>
          <div className='flex items-center justify-center gap-6 mb-4'>
            <Link
              href='https://github.com'
              className='flex items-center gap-2 hover:text-gray-700 transition-colors'
            >
              <Github className='w-5 h-5' />
              View on GitHub
            </Link>
            <span>•</span>
            <Link
              href='/dashboard'
              className='hover:text-gray-700 transition-colors'
            >
              Dashboard
            </Link>
            <span>•</span>
            <Link
              href='/messages'
              className='hover:text-gray-700 transition-colors'
            >
              Messages
            </Link>
          </div>
          <p className='text-sm'>
            Better Auth Messages - A real-time messaging demo application
          </p>
        </footer>
      </div>
    </div>
  );
}
