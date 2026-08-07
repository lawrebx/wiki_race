interface WaitingRoomProps {
  gameState: any;
  isHost: boolean;
  onStartGame: () => void;
}

export default function WaitingRoom({ gameState, isHost, onStartGame }: WaitingRoomProps) {
  const { lobby, players } = gameState;

  const copyInviteLink = () => {
    const inviteUrl = `${window.location.origin}/join/${lobby.code}`;
    navigator.clipboard.writeText(inviteUrl);
    alert('Invite link copied to clipboard!');
  };

  const canStart = players.length >= 2;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-900 mb-2">Lobby</h1>
          <div className="flex items-center justify-center gap-4">
            <div className="bg-white px-6 py-3 rounded-lg shadow">
              <span className="text-sm text-gray-600">Code: </span>
              <span className="font-mono text-2xl font-bold text-primary-600">
                {lobby.code}
              </span>
            </div>
            <button
              onClick={copyInviteLink}
              className="btn btn-secondary"
            >
              📋 Copy Invite Link
            </button>
          </div>
        </div>

        {/* Game Settings */}
        <div className="card mb-6">
          <h2 className="text-2xl font-bold mb-4">Game Settings</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-gray-600">Start Article:</span>
              <p className="font-medium">{lobby.startArticle || 'Random'}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Target Article:</span>
              <p className="font-medium">{lobby.targetArticle || 'Random'}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Time Limit:</span>
              <p className="font-medium">
                {lobby.timeLimit ? `${Math.floor(lobby.timeLimit / 60)} minutes` : 'None'}
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Max Players:</span>
              <p className="font-medium">{lobby.maxPlayers}</p>
            </div>
            {lobby.difficulty && (
              <div>
                <span className="text-sm text-gray-600">Difficulty:</span>
                <p className="font-medium capitalize">{lobby.difficulty}</p>
              </div>
            )}
          </div>
        </div>

        {/* Players List */}
        <div className="card mb-6">
          <h2 className="text-2xl font-bold mb-4">
            Players ({players.length}/{lobby.maxPlayers})
          </h2>
          <div className="space-y-2">
            {players.map((player: any) => (
              <div
                key={player.id}
                className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg"
              >
                <span className="font-medium">{player.displayName}</span>
                {player.sessionId === lobby.hostId && (
                  <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded text-sm font-medium">
                    Host
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Start Button */}
        {isHost && (
          <div className="card">
            {!canStart && (
              <p className="text-amber-600 mb-4 text-center">
                Waiting for at least one more player to join...
              </p>
            )}
            <button
              onClick={onStartGame}
              disabled={!canStart}
              className={`btn w-full text-lg ${
                canStart ? 'btn-primary' : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              Start Game
            </button>
          </div>
        )}

        {!isHost && (
          <div className="card text-center">
            <p className="text-gray-600">Waiting for host to start the game...</p>
          </div>
        )}
      </div>
    </div>
  );
}
