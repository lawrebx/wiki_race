interface GameHeaderProps {
  currentPage: string;
  targetArticle: string;
  clickCount: number;
  elapsedTime: string;
  timeLimit: string | null;
  isFinished: boolean;
  gameEnded: boolean;
}

export default function GameHeader({
  currentPage,
  targetArticle,
  clickCount,
  elapsedTime,
  timeLimit,
  isFinished,
  gameEnded,
}: GameHeaderProps) {
  return (
    <div className="bg-white border-b shadow-sm h-20">
      <div className="h-full px-6 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div>
            <span className="text-sm text-gray-600">Current:</span>
            <p className="font-bold text-lg text-primary-600">
              {currentPage?.replace(/_/g, ' ')}
            </p>
          </div>
          <div className="text-2xl text-gray-400">→</div>
          <div>
            <span className="text-sm text-gray-600">Target:</span>
            <p className="font-bold text-lg text-green-600">
              {targetArticle?.replace(/_/g, ' ')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-center">
            <span className="text-sm text-gray-600">Clicks</span>
            <p className="font-bold text-2xl">{clickCount}</p>
          </div>
          <div className="text-center">
            <span className="text-sm text-gray-600">Time</span>
            <p className="font-bold text-2xl font-mono">
              {elapsedTime}
              {timeLimit && <span className="text-sm text-gray-400">/{timeLimit}</span>}
            </p>
          </div>
          {(isFinished || gameEnded) && (
            <div className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium">
              {isFinished ? 'Finished' : 'Game Over'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
