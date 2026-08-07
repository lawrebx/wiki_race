import { useEffect, useState } from 'react';
import WikipediaArticle from './WikipediaArticle';
import CompetitorPanel from './CompetitorPanel';
import GameHeader from './GameHeader';

interface GameViewProps {
  gameState: any;
  currentPlayer: any;
  onMove: (targetPage: string) => void;
}

export default function GameView({ gameState, currentPlayer, onMove }: GameViewProps) {
  const { lobby, players, deadPages, occupiedPages } = gameState;
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (lobby.status !== 'in_progress') return;

    const startTime = new Date(lobby.startedAt).getTime();
    
    const timer = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000);
      setElapsedTime(elapsed);

      // Check time limit
      if (lobby.timeLimit && elapsed >= lobby.timeLimit) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [lobby]);

  const isFinished = currentPlayer.status === 'finished';
  const gameEnded = lobby.status === 'finished';

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Game Header */}
      <GameHeader
        currentPage={currentPlayer.currentPage}
        targetArticle={lobby.targetArticle}
        clickCount={currentPlayer.clickCount}
        elapsedTime={formatTime(elapsedTime)}
        timeLimit={lobby.timeLimit ? formatTime(lobby.timeLimit) : null}
        isFinished={isFinished}
        gameEnded={gameEnded}
      />

      <div className="flex h-[calc(100vh-80px)]">
        {/* Wikipedia Article View */}
        <div className="flex-1 overflow-auto">
          <WikipediaArticle
            articleTitle={currentPlayer.currentPage}
            deadPages={deadPages}
            occupiedPages={occupiedPages}
            onLinkClick={onMove}
            disabled={isFinished || gameEnded}
            path={currentPlayer.path}
          />
        </div>

        {/* Competitor Panel */}
        <div className="w-80 border-l bg-white overflow-auto">
          <CompetitorPanel
            players={players}
            currentPlayerId={currentPlayer.id}
            targetArticle={lobby.targetArticle}
          />
        </div>
      </div>

      {/* Finish Modal */}
      {isFinished && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="card max-w-md">
            <h2 className="text-3xl font-bold text-center mb-4">
              {currentPlayer.rank === 1 ? '🎉 You Won!' : '✅ You Finished!'}
            </h2>
            <div className="space-y-2 mb-6">
              <p className="text-center text-lg">
                <span className="font-bold">Rank:</span> #{currentPlayer.rank}
              </p>
              <p className="text-center">
                <span className="font-bold">Clicks:</span> {currentPlayer.clickCount}
              </p>
              <p className="text-center">
                <span className="font-bold">Time:</span> {formatTime(Math.floor((new Date(currentPlayer.finishedAt).getTime() - new Date(lobby.startedAt).getTime()) / 1000))}
              </p>
            </div>
            <p className="text-center text-gray-600">
              {gameEnded ? 'Game over! Check the leaderboard.' : 'Waiting for other players to finish...'}
            </p>
          </div>
        </div>
      )}

      {/* Game Over Modal */}
      {gameEnded && !isFinished && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="card max-w-md">
            <h2 className="text-3xl font-bold text-center mb-4">Game Over</h2>
            <p className="text-center text-gray-600">
              {lobby.timeLimit && elapsedTime >= lobby.timeLimit
                ? 'Time limit reached!'
                : 'All players finished!'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
