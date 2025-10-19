import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.js';

// WaveSurfer v7 types
type WaveSurferType = ReturnType<typeof WaveSurfer.create>;

interface AudioContextType {
  audioUrl: string | null;
  audioFileName: string | null;
  isPlaying: boolean;
  audioStart: number;
  audioEnd: number;
  waveformRef: React.RefObject<HTMLDivElement>;
  wavesurfer: WaveSurferType | null;
  regionsPlugin: any | null;
  handleAudioUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveAudio: () => void;
  togglePlayPause: () => void;
  setIsPlaying: (playing: boolean) => void;
  setAudioStart: (start: number) => void;
  setAudioEnd: (end: number) => void;
  getDuration: () => number;
  getActualDuration: () => number;
}

const AudioContext = createContext<AudioContextType | null>(null);

interface AudioProviderProps {
  children: ReactNode;
  onDurationChange?: (duration: number) => void;
}

export const AudioProvider: React.FC<AudioProviderProps> = ({ children, onDurationChange }) => {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioFileName, setAudioFileName] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioStart, setAudioStart] = useState(0);
  const [audioEnd, setAudioEnd] = useState(0);
  const [wavesurfer, setWavesurfer] = useState<WaveSurferType | null>(null);
  const [regionsPlugin, setRegionsPlugin] = useState<any | null>(null);

  const waveformRef = useRef<HTMLDivElement>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const cleanupWaveSurfer = () => {
    if (resizeObserverRef.current) {
      resizeObserverRef.current.disconnect();
      resizeObserverRef.current = null;
    }
    
    if (wavesurfer && !wavesurfer.isDestroyed) {
      try {
        wavesurfer.destroy();
      } catch (error) {
        console.warn('Error destroying wavesurfer:', error);
      }
    }
    setWavesurfer(null);
  };

  const initWaveSurfer = async (audioFile: File) => {
    if (!waveformRef.current) return null;

    // Cleanup previous instance
    cleanupWaveSurfer();

    try {
      // Create regions plugin
      const regions = RegionsPlugin.create();

      const ws = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: 'rgba(255, 255, 255, 0.3)',
        progressColor: '#6366f1',
        cursorColor: '#ffffff',
        barWidth: 2,
        barGap: 1,
        barRadius: 2,
        height: 64,
        normalize: true,
        responsive: true,
        fillParent: true,
        minPxPerSec: 50,
        interact: true,
        plugins: [regions]
      });

      setRegionsPlugin(regions);

      // Set up event listeners before loading
      ws.on('ready', () => {
        const duration = ws.getDuration();
        setAudioStart(0);
        setAudioEnd(duration);
        if (onDurationChange) {
          onDurationChange(duration);
        }

        // Create initial region for the full audio
        regions.clearRegions();
        regions.addRegion({
          start: 0,
          end: duration,
          color: 'rgba(99, 102, 241, 0.2)',
          drag: true,
          resize: true
        });
      });

      // Listen to region updates
      regions.on('region-updated', (region: any) => {
        setAudioStart(region.start);
        setAudioEnd(region.end);
      });

      ws.on('play', () => setIsPlaying(true));
      ws.on('pause', () => setIsPlaying(false));
      ws.on('finish', () => setIsPlaying(false));

      // Set up resize observer
      if (window.ResizeObserver && waveformRef.current) {
        resizeObserverRef.current = new ResizeObserver(() => {
          if (ws && !ws.isDestroyed && waveformRef.current) {
            // Use a small delay to ensure the container has finished resizing
            setTimeout(() => {
              if (ws && !ws.isDestroyed) {
                try {
                  ws.drawer?.drawBuffer();
                } catch (error) {
                  console.warn('Error redrawing waveform:', error);
                }
              }
            }, 10);
          }
        });
        resizeObserverRef.current.observe(waveformRef.current);
      }

      // Load the audio file
      await ws.loadBlob(audioFile);
      
      setWavesurfer(ws);
      return ws;
    } catch (error) {
      console.error('Failed to initialize WaveSurfer:', error);
      throw error;
    }
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // More comprehensive audio type validation
    const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/aiff', 'audio/x-aiff', 'audio/ogg', 'audio/flac'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const validExtensions = ['mp3', 'wav', 'aiff', 'aif', 'ogg', 'flac'];

    if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension || '')) {
      alert('Please upload a valid audio file (MP3, WAV, AIFF, OGG, or FLAC)');
      return;
    }

    // Check file size (limit to 50MB)
    if (file.size > 50 * 1024 * 1024) {
      alert('Audio file is too large. Please upload a file smaller than 50MB.');
      return;
    }

    // Cleanup previous resources
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }

    try {
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
      setAudioFileName(file.name);
      setAudioStart(0);

      // Initialize WaveSurfer with the file
      await initWaveSurfer(file);
    } catch (error) {
      console.error('Failed to load audio:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load audio file';
      alert(`Error: ${errorMessage}. Please try a different file.`);
      handleRemoveAudio();
    }
  };

  const togglePlayPause = () => {
    if (wavesurfer && !wavesurfer.isDestroyed) {
      try {
        wavesurfer.playPause();
      } catch (error) {
        console.warn('Error toggling playback:', error);
      }
    }
  };

  const getDuration = (): number => {
    return audioEnd - audioStart;
  };

  const getActualDuration = (): number => {
    if (wavesurfer && !wavesurfer.isDestroyed) {
      return wavesurfer.getDuration();
    }
    return 0;
  };

  const handleRemoveAudio = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    
    cleanupWaveSurfer();

    setAudioUrl(null);
    setAudioFileName(null);
    setIsPlaying(false);
    setAudioStart(0);
    setAudioEnd(0);
    setRegionsPlugin(null);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      cleanupWaveSurfer();
    };
  }, []);

  // Update region when audioStart or audioEnd changes externally
  useEffect(() => {
    if (regionsPlugin && wavesurfer && !wavesurfer.isDestroyed) {
      const regions = regionsPlugin.getRegions();
      if (regions.length > 0) {
        const region = regions[0];
        if (region.start !== audioStart || region.end !== audioEnd) {
          region.setOptions({ start: audioStart, end: audioEnd });
        }
      }
    }
  }, [audioStart, audioEnd, regionsPlugin, wavesurfer]);

  const value = {
    audioUrl,
    audioFileName,
    isPlaying,
    audioStart,
    audioEnd,
    waveformRef,
    wavesurfer,
    regionsPlugin,
    handleAudioUpload,
    handleRemoveAudio,
    togglePlayPause,
    setIsPlaying,
    setAudioStart,
    setAudioEnd,
    getDuration,
    getActualDuration
  };

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudioContext = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudioContext must be used within an AudioProvider');
  }
  return context;
};