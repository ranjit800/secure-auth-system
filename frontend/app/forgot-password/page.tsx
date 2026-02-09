'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/api/auth/forgot-password`,
        { email },
        { withCredentials: true }
      );

      if (response.data.success) {
        setSuccess(response.data.message);
        setEmail('');
        
        // Redirect to login after 5 seconds
        setTimeout(() => {
          router.push('/login');
        }, 5000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white font-sans">
      {/* Left Section - Hero Image */}
      <div className="hidden lg:block w-1/2 relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/Heromiage.webp')" }}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/10"></div>
        </div>
        
        {/* Welcome Text overlay on image */}
        <div className="relative z-10 p-12 h-full flex flex-col justify-end text-white">
          <div className="mb-20 animate-fade-in-up">
            <h2 className="text-6xl font-bold leading-tight drop-shadow-lg text-shadow">
              Reset Password
            </h2>
            <p className="mt-4 text-white text-lg max-w-md drop-shadow-md text-shadow">
              Securely recover your account access.
            </p>
          </div>
        </div>
      </div>

      {/* Right Section - White Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16 bg-white relative">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-4xl font-bold text-gray-900 mb-2">Forgot Password?</h2>
            <p className="text-gray-500">Enter your email and we'll send you a reset link.</p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg animate-pulse">
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-lg">
              <div className="font-semibold mb-1">✅ Email Sent</div>
              {success}
              <p className="text-sm mt-2 text-green-800">Redirecting to login in 5 seconds...</p>
            </div>
          )}

          {!success && (
            <form onSubmit={handleSubmit} className="space-y-6 mt-8">
              <div className="space-y-1">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-100 border-none rounded-lg focus:ring-2 focus:ring-black focus:bg-white transition-all duration-200 outline-none placeholder-gray-400"
                  placeholder="you@example.com"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-3.5 rounded-full font-bold text-lg hover:bg-gray-800 transform hover:scale-[1.02] transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
              >
                {loading ? 'Sending Link...' : 'Send Reset Link'}
              </button>
            </form>
          )}

          <div className="text-center mt-6">
            <Link 
              href="/login" 
              className="text-gray-500 hover:text-black hover:underline transition-colors font-medium flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
              </svg>
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
