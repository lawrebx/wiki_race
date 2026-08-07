'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';

export default function HomePage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [lobbyCode, setLobbyCode] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [startArticle, setStartArticle] = useState('');
  const [targetArticle, setTargetArticle] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [timeLimit, setTimeLimit] = useState(10);
  const [maxPlayers, setMaxPlayers] = useState(8);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreateLobby = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setError('Please enter your name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await apiClient.createLobby({
        displayName: displayName.trim(),
        startArticle: startArticle.trim() || undefined,
        targetArticle: targetArticle.trim() || undefined,
        difficulty: !startArticle && !targetArticle ? difficulty : undefined,
        timeLimit: timeLimit * 60, // Convert to seconds
        maxPlayers,
      });

      // Navigate to lobby
      router.push(`/lobby/${response.lobby.id}?player=${response.player.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create lobby');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinLobby = () => {
    if (!lobbyCode.trim()) {
      setError('Please enter a lobby code');
      return;
    }
    router.push(`/join/${lobbyCode.trim().toUpperCase()}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-primary-900 mb-4">
            Wiki Race
          </h1>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            Race from one Wikipedia article to another. Every page you leave becomes dead.
            Outsmart your opponents in real-time multiplayer competition.
          </p>
        </div>

        {/* Main content */}
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          {/* Create Lobby Card */}
          <div className="card">
            <h2 className="text-2xl font-bold mb-4">Create a Lobby</h2>
            <form onSubmit={handleCreateLobby} className="space-y-4">
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
                />
              </div>

              {/* Advanced Options */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                >
                  {showAdvanced ? '▼' : '▶'} Advanced Options
                </button>
              </div>

              {showAdvanced && (
                <div className="space-y-4 border-l-4 border-primary-200 pl-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Start Article (optional)
                    </label>
                    <input
                      type="text"
                      value={startArticle}
                      onChange={(e) => setStartArticle(e.target.value)}
                      className="input w-full"
                      placeholder="e.g., Peanut_butter"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Target Article (optional)
                    </label>
                    <input
                      type="text"
                      value={targetArticle}
                      onChange={(e) => setTargetArticle(e.target.value)}
                      className="input w-full"
                      placeholder="e.g., Apollo_11"
                    />
                  </div>

                  {!startArticle && !targetArticle && (
                    <div>
                      <label className="block text-sm font-medium mb-1">Difficulty</label>
                      <select
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value as any)}
                        className="input w-full"
                      >
                        <option value="easy">Easy (3-5 clicks)</option>
                        <option value="medium">Medium (5-8 clicks)</option>
                        <option value="hard">Hard (8+ clicks)</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Time Limit (minutes)
                    </label>
                    <input
                      type="number"
                      value={timeLimit}
                      onChange={(e) => setTimeLimit(parseInt(e.target.value) || 10)}
                      className="input w-full"
                      min={1}
                      max={60}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Max Players</label>
                    <input
                      type="number"
                      value={maxPlayers}
                      onChange={(e) => setMaxPlayers(parseInt(e.target.value) || 8)}
                      className="input w-full"
                      min={2}
                      max={20}
                    />
                  </div>
                </div>
              )}

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
                {loading ? 'Creating...' : 'Create Lobby'}
              </button>
            </form>
          </div>

          {/* Join Lobby Card */}
          <div className="card">
            <h2 className="text-2xl font-bold mb-4">Join a Lobby</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Lobby Code</label>
                <input
                  type="text"
                  value={lobbyCode}
                  onChange={(e) => setLobbyCode(e.target.value.toUpperCase())}
                  className="input w-full uppercase"
                  placeholder="Enter 6-character code"
                  maxLength={6}
                />
              </div>

              <button
                onClick={handleJoinLobby}
                className="btn btn-primary w-full"
              >
                Join Lobby
              </button>

              {/* How to Play */}
              <div className="mt-8 pt-6 border-t">
                <h3 className="font-bold mb-2">How to Play</h3>
                <ul className="text-sm space-y-2 text-gray-600">
                  <li>• Click Wikipedia links to navigate</li>
                  <li>• Race to reach the target article</li>
                  <li>• Pages you leave become DEAD</li>
                  <li>• Dead pages block everyone</li>
                  <li>• First to finish wins!</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-center mb-8">Features</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="card text-center">
              <div className="text-4xl mb-3">⚡</div>
              <h4 className="font-bold mb-2">Real-Time</h4>
              <p className="text-sm text-gray-600">
                Live multiplayer action with instant updates
              </p>
            </div>
            <div className="card text-center">
              <div className="text-4xl mb-3">☠️</div>
              <h4 className="font-bold mb-2">Dead Pages</h4>
              <p className="text-sm text-gray-600">
                Strategic path blocking mechanic
              </p>
            </div>
            <div className="card text-center">
              <div className="text-4xl mb-3">🏆</div>
              <h4 className="font-bold mb-2">Competitive</h4>
              <p className="text-sm text-gray-600">
                Rankings, timing, and click count tracking
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
