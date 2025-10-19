import React, { useEffect } from 'react';
import { useAudioContext } from '../context/AppContext';

const AudioWaveform = () => {
  const { wavesurfer, isPlaying } = useAudioContext();

  // Sync external play/pause state with WaveSurfer
  useEffect(() => {
    if (!wavesurfer || wavesurfer.isDestroyed) return;

    try {
      const isWaveSurferPlaying = wavesurfer.isPlaying();
      
      if (isPlaying && !isWaveSurferPlaying) {
        wavesurfer.play();
      } else if (!isPlaying && isWaveSurferPlaying) {
        wavesurfer.pause();
      }
    } catch (error) {
      console.warn('Error syncing playback state:', error);
    }
  }, [isPlaying, wavesurfer]);

  return null; // This component doesn't render anything - it just manages sync
};

export default AudioWaveform;