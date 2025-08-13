'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, User, Settings } from 'lucide-react';
import { authClient } from '@/lib/auth-client';

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push('/auth');
    }
  }, [session, isPending, router]);

  const handleSignOut = async () => {
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push('/auth');
          },
        },
      });
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (isPending) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-lg'>Loading...</div>
      </div>
    );
  }

  if (!session?.user) {
    return null; // Will redirect to auth
  }

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900'>Dashboard</h1>
          <p className='mt-2 text-gray-600'>Welcome to Better Auth Messages!</p>
        </div>

        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <User className='w-5 h-5' />
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-2'>
                <p className='truncate'>
                  <strong>Name:</strong> {session.user.name || 'Not provided'}
                </p>
                <p className='truncate'>
                  <strong>Email:</strong> {session.user.email}
                </p>
                <p className='truncate'>
                  <strong>ID:</strong> {session.user.id}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <MessageCircle className='w-5 h-5' />
                Messages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-gray-600 mb-4'>
                Start real-time conversations with other users!
              </p>
              <Button
                onClick={() => router.push('/messages')}
                className='w-full'
              >
                <MessageCircle className='w-4 h-4 mr-2' />
                Open Messages
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Settings className='w-5 h-5' />
                Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleSignOut}
                variant='destructive'
                className='w-full'
              >
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
