import React, { useEffect, useState } from 'react';
import { Play, Pause, RotateCcw, Timer } from 'lucide-react';
import { useAudioContext } from '../context/AppContext';

interface AudioTrimmerProps {
  maxDuration?: number; // in seconds
  isPro?: boolean;
}

const AudioTrimmer: React.FC<AudioTrimmerProps> = ({ 
  maxDuration = 60,
  isPro = false
}) => {
  const {
    audioUrl,
    isPlaying,
    audioStart,
    audioEnd,
    wavesurfer,
    setAudioStart,
    setAudioEnd,
    togglePlayPause,
    getDuration,
    getActualDuration
  } = useAudioContext();

  const [isDragging, setIsDragging] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    if (wavesurfer) {
      const handleTimeUpdate = () => {
        setCurrentTime(wavesurfer.getCurrentTime());
      };

      wavesurfer.on('timeupdate', handleTimeUpdate);
      return () => {
        wavesurfer.un('timeupdate', handleTimeUpdate);
      };
    }
  }, [wavesurfer]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleReset = () => {
    const actualDuration = getActualDuration();
    if (actualDuration > 0) {
      setAudioStart(0);
      setAudioEnd(actualDuration);
      if (wavesurfer) {
        wavesurfer.setTime(0);
      }
    }
  };

  if (!audioUrl) return null;

  const duration = getDuration();
  const allowedDuration = isPro ? 300 : 60; // 5 minutes for pro, 1 minute for free
  const isOverLimit = duration > allowedDuration;

  return (
    <div className="space-y-4 bg-black/20 p-6 rounded-xl">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-white">Selected Audio Segment</h3>
          <span className="text-xs text-zinc-400">
            {formatTime(duration)} selected
          </span>
        </div>

        <div className="bg-black/40 rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs text-zinc-400">Start Time</span>
            <span className="text-sm text-white font-mono">{formatTime(audioStart)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-zinc-400">End Time</span>
            <span className="text-sm text-white font-mono">{formatTime(audioEnd)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-zinc-400">Duration</span>
            <span className="text-sm text-white font-mono">{formatTime(duration)}</span>
          </div>
        </div>

        <p className="text-xs text-zinc-500 mt-2">
          Drag the highlighted region on the waveform above to adjust the selection
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all text-sm"
          aria-label="Reset to full audio"
        >
          <RotateCcw className="w-4 h-4" />
          Reset Selection
        </button>

        <div className="flex-1" />

        {isOverLimit && (
          <div className="flex items-center gap-2 text-amber-400">
            <Timer className="w-4 h-4" />
            <span className="text-xs">
              {isPro ? "Limit: 5 minutes" : "Limit: 60 seconds"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioTrimmer; 