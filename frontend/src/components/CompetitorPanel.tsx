import { useState } from 'react';

interface CompetitorPanelProps {
  players: any[];
  currentPlayerId: string;
  targetArticle: string;
}

export default function CompetitorPanel({ players, currentPlayerId, targetArticle }: CompetitorPanelProps) {
  const [hoveredPlayer, setHoveredPlayer] = useState<string | null>(null);

  // Sort players by rank, then by status
  const sortedPlayers = [...players].sort((a, b) => {
    if (a.status === 'finished' && b.status === 'finished') {
      return (a.rank || 999) - (b.rank || 999);
    }
    if (a.status === 'finished') return -1;
    if (b.status === 'finished') return 1;
    return a.joinedAt - b.joinedAt;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'finished':
        return 'bg-blue-100 text-blue-700';
      case 'disconnected':
        return 'bg-gray-100 text-gray-500';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return '🎮';
      case 'finished':
        return '✅';
      case 'disconnected':
        return '❌';
      default:
        return '⏳';
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Players</h2>
      <div className="space-y-3">
        {sortedPlayers.map((player) => {
          const isCurrentPlayer = player.id === currentPlayerId;
          const isFinished = player.status === 'finished';
          
          return (
            <div
              key={player.id}
              className={`relative rounded-lg p-3 border-2 transition-all ${
                isCurrentPlayer
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
              onMouseEnter={() => setHoveredPlayer(player.id)}
              onMouseLeave={() => setHoveredPlayer(null)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <div className="font-bold truncate">
                    {player.displayName}
                    {isCurrentPlayer && <span className="text-primary-600 ml-1">(You)</span>}
                  </div>
                  {isFinished && player.rank && (
                    <div className="text-sm font-bold text-blue-600">
                      Rank #{player.rank}
                    </div>
                  )}
                </div>
                <div className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(player.status)}`}>
                  {getStatusIcon(player.status)} {player.status}
                </div>
              </div>

              <div className="text-sm space-y-1">
                <div className="text-gray-600">
                  <span className="font-medium">Current:</span>{' '}
                  <span className="text-gray-900">
                    {player.currentPage?.replace(/_/g, ' ') || 'Not started'}
                  </span>
                </div>
                <div className="text-gray-600">
                  <span className="font-medium">Clicks:</span> {player.clickCount}
                </div>
              </div>

              {/* Path Tooltip */}
              {hoveredPlayer === player.id && player.path && player.path.length > 0 && (
                <div className="absolute left-0 bottom-full mb-2 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-lg z-10">
                  <div className="font-bold mb-2">{player.displayName}'s path:</div>
                  <div className="space-y-1">
                    {player.path.map((page: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-gray-400">{idx + 1}.</span>
                        <span className={
                          page === targetArticle
                            ? 'text-green-400 font-bold'
                            : idx === player.path.length - 1
                            ? 'text-blue-400 font-medium'
                            : ''
                        }>
                          {page.replace(/_/g, ' ')}
                        </span>
                      </div>
                    ))}
                  </div>
                  {/* Arrow pointing down */}
                  <div className="absolute left-4 top-full w-0 h-0 border-l-4 border-r-4 border-t-8 border-transparent border-t-gray-900"></div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
