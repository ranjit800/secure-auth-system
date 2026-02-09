'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { sessionAPI } from '@/lib/api';
import { Session } from '@/types';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { user, loading, logout, checkAuth } = useAuthStore();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState('');
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user) {
      fetchSessions();
    }
  }, [user, loading, router]);

  const fetchSessions = async () => {
    try {
      const response = await sessionAPI.getSessions();
      setSessions(response.data.data.sessions);
      setCurrentSessionId(response.data.data.currentSessionId);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load sessions');
    } finally {
      setLoadingSessions(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to revoke this session?')) return;

    try {
      await sessionAPI.revokeSession(sessionId);
      if (sessionId === currentSessionId) {
        // Current session revoked, logout
        await logout();
        router.push('/login');
      } else {
        // Refresh sessions list
        fetchSessions();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to revoke session');
    }
  };

  const handleLogoutAll = async () => {
    if (!confirm('Are you sure you want to logout from all devices?')) return;

    try {
      await logout();
      router.push('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to logout');
    }
  };

  if (loading || loadingSessions) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-2xl font-bold text-indigo-600">Secure Auth System</h1>
            <div className="flex gap-4">
              <button
                onClick={logout}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* User Info Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Dashboard</h2>
          <div className="space-y-2">
            <p className="text-gray-700">
              <span className="font-semibold">Email:</span> {user.email}
            </p>
            <p className="text-gray-700">
              <span className="font-semibold">Status:</span>{' '}
              {user.isEmailVerified ? (
                <span className="text-green-600">✅ Verified</span>
              ) : (
                <span className="text-yellow-600">⚠️ Not Verified</span>
              )}
            </p>
          </div>
        </div>

        {/* Sessions Management */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Active Sessions</h3>
            <button
              onClick={handleLogoutAll}
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 text-sm"
            >
              Logout All Devices
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {sessions.length === 0 ? (
              <p className="text-gray-500">No active sessions</p>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.sessionId}
                  className={`border rounded-lg p-4 ${
                    session.sessionId === currentSessionId
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-gray-900">
                          {session.deviceInfo.browser} on {session.deviceInfo.os}
                        </h4>
                        {session.sessionId === currentSessionId && (
                          <span className="text-xs bg-indigo-600 text-white px-2 py-1 rounded">
                            Current
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>
                          <span className="font-medium">Type:</span> {session.deviceInfo.type}
                        </p>
                        <p>
                          <span className="font-medium">IP:</span> {session.ipAddress}
                        </p>
                        <p>
                          <span className="font-medium">Last Active:</span>{' '}
                          {new Date(session.lastActive).toLocaleString()}
                        </p>
                        <p>
                          <span className="font-medium">Created:</span>{' '}
                          {new Date(session.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRevokeSession(session.sessionId)}
                      className="ml-4 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 text-sm"
                    >
                      Revoke
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
