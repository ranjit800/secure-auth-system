'use client';

import { useState, useEffect, Suspense } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

// Separate component for search params
function VerificationMessage() {
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const searchParams = useSearchParams();

  useEffect(() => {
    const verified = searchParams.get('verified');
    const errorParam = searchParams.get('error');
    
    if (verified === 'true') {
      setSuccess('✅ Email verified successfully! You can now log in.');
    } else if (verified === 'false') {
      if (errorParam === 'invalid-token') {
        setError('❌ Invalid or expired verification link. Please register again.');
      }
    }
  }, [searchParams]);

  return (
    <>
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg animate-pulse">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-lg">
          {success}
        </div>
      )}
    </>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((state) => state.login);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
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
          style={{ backgroundImage: "url('/Heromiage.jpg')" }}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/10"></div>
        </div>
        
        {/* Welcome Text overlay on image */}
        <div className="relative z-10 p-12 h-full flex flex-col justify-end text-white">
          <div className="mb-20 animate-fade-in-up">
            <h2 className="text-6xl font-bold leading-tight drop-shadow-lg text-shadow">
              Welcome!
            </h2>
            <p className="mt-4 text-white text-lg max-w-md drop-shadow-md text-shadow">
              Log in to access your secure dashboard.
            </p>
          </div>
        </div>
      </div>

      {/* Right Section - White Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16 bg-white relative">
        {/* Mobile Header (visible only on small screens) */}
        {/* Branding removed as requested */}

        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-4xl font-bold text-gray-900 mb-2">Log in</h2>
            <p className="text-gray-500">Welcome back! Please enter your details.</p>
          </div>

          <Suspense fallback={null}>
            <VerificationMessage />
          </Suspense>

          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg animate-pulse">
              {error}
            </div>
          )}

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

            <div className="space-y-1">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-100 border-none rounded-lg focus:ring-2 focus:ring-black focus:bg-white transition-all duration-200 outline-none placeholder-gray-400"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-3.5 rounded-full font-bold text-lg hover:bg-gray-800 transform hover:scale-[1.02] transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="relative flex items-center justify-center my-6">
            <div className="absolute w-full border-t border-gray-200"></div>
            <span className="relative bg-white px-4 text-sm text-gray-500">Or</span>
          </div>

          <div className="space-y-4 text-center">
             <Link 
              href="/register" 
              className="w-full inline-block bg-gray-200 text-gray-800 py-3.5 rounded-full font-semibold hover:bg-gray-300 transition-colors"
            >
              Sign up
            </Link>

            <Link href="/forgot-password" className="text-sm text-gray-500 hover:text-black hover:underline block transition-colors">
              Forgot password?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
