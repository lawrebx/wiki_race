'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { apiClient } from '@/lib/api';

export default function JoinLobbyPage() {
  const router = useRouter();
  const params = useParams();
  const code = params.code as string;
  
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setError('Please enter your name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await apiClient.joinLobby(code, {
        displayName: displayName.trim(),
      });

      // Navigate to lobby
      router.push(`/lobby/${response.lobby.id}?player=${response.player.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to join lobby');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="card max-w-md w-full">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-primary-900 mb-2">Join Lobby</h1>
          <p className="text-gray-600">Lobby Code: <span className="font-mono font-bold text-xl">{code}</span></p>
        </div>

        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Your Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="input w-full"
              placeholder="Enter your name"
              maxLength={50}
              required
              autoFocus
            />
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full"
          >
            {loading ? 'Joining...' : 'Join Lobby'}
          </button>

          <button
            type="button"
            onClick={() => router.push('/')}
            className="btn btn-secondary w-full"
          >
            Back to Home
          </button>
        </form>
      </div>
    </div>
  );
}
