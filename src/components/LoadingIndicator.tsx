import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingIndicatorProps {
  message?: string;
  className?: string;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ 
  message = 'Loading...', 
  className = '' 
}) => {
  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <Loader2 className="w-5 h-5 animate-spin text-white/70" />
      <span className="text-sm text-white/70">{message}</span>
    </div>
  );
};

export default LoadingIndicator; 