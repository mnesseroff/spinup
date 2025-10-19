import React from 'react';

interface ProgressBarProps {
  progress: number;
  className?: string;
  showPercentage?: boolean;
  height?: number;
  color?: string;
  backgroundColor?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  className = '',
  showPercentage = false,
  height = 8,
  color = 'bg-brand',
  backgroundColor = 'bg-black/40'
}) => {
  // Ensure progress is between 0-100
  const safeProgress = Math.min(100, Math.max(0, progress));
  
  return (
    <div className={`relative w-full overflow-hidden rounded-full ${backgroundColor} ${className}`} style={{ height }}>
      <div 
        className={`absolute left-0 top-0 bottom-0 progress-bar ${color}`} 
        style={{ width: `${safeProgress}%` }}
        role="progressbar"
        aria-valuenow={safeProgress}
        aria-valuemin={0}
        aria-valuemax={100}
      />
      {showPercentage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-medium text-white">{Math.round(safeProgress)}%</span>
        </div>
      )}
    </div>
  );
};

export default ProgressBar; 