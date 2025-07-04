'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const Page = () => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/signout', {
        method: 'GET',
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        setMessage(data.message);
        // Redirect to signin page after a short delay
        setTimeout(() => {
          router.push('/signin');
        }, 1500);
      } else {
        setMessage(data.error || 'Signout failed');
      }
    } catch (error) {
      console.error('Signout error:', error);
      setMessage('Network error during signout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">
            Welcome to Legal Network
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            You are successfully logged in
          </p>
        </div>

        {message && (
          <div className={`p-4 rounded-md ${
            message.includes('success') || message.includes('Logged out') 
              ? 'bg-green-100 border border-green-400 text-green-700' 
              : 'bg-red-100 border border-red-400 text-red-700'
          }`}>
            {message}
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={handleSignOut}
            disabled={loading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing out...' : 'Sign Out'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Page;