'use client';

import { useState } from 'react';
import { AuthForm } from '@/components/auth/auth-form';

export default function AuthPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  const toggleMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8'>
        <div>
          <h1 className='text-3xl font-bold text-center text-gray-900'>
            Better Auth Messages
          </h1>
          <p className='mt-2 text-center text-sm text-gray-600'>
            Real-time messaging with secure authentication
          </p>
        </div>
        <AuthForm mode={mode} onToggleMode={toggleMode} />
      </div>
    </div>
  );
}
