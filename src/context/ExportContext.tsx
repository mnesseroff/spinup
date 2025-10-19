import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  ReactNode,
} from 'react';

import { toPng } from 'html-to-image';
import { useVinylContext } from './VinylContext';
import { useAudioContext } from './AudioContext';
import { EXPORT_SETTINGS } from '../config/exportSettings';
import { ExportQuality } from '../Types';

type WorkerMessage =
  | {
      type:
        | 'workerReady'
        | 'ffmpegLoading'
        | 'ffmpegLoaded'
        | 'ffmpegLoadError'
        | 'exportProgress'
        | 'exportComplete'
        | 'exportError';
      progress?: number;
      message?: string;
      error?: string;
      videoBlob?: Blob;
    }
  | any;

type ExportContextValue = {
  // progress / status
  isExporting: boolean;
  exportProgress: number;
  exportProgressMessage: string;
  exportError: string | null;

  // ffmpeg/worker status (names kept for your existing UI)
  isWorkerReady: boolean;
  isFFmpegLoading: boolean;
  isFFmpegReady: boolean;
  ffmpegLoadError: string | null;

  // settings
  exportQuality: ExportQuality;
  setExportQuality: (q: ExportQuality) => void;

  // duration
  videoDuration: number;
  setVideoDuration: (s: number) => void;

  // actions
  handleExport: () => Promise<void>;
};

const ExportContext = createContext<ExportContextValue | null>(null);

export const ExportProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // External contexts
  const { vinylRef, setCaptureRotation } = useVinylContext();
  const { audioUrl, audioStart = 0, audioEnd = 0 } = useAudioContext() as {
    audioUrl: string | null;
    audioStart: number;
    audioEnd: number;
  };

  // --- State
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportProgressMessage, setExportProgressMessage] = useState('');
  const [exportError, setExportError] = useState<string | null>(null);

  const [isWorkerReady, setIsWorkerReady] = useState(false);
  const [isFFmpegLoading, setIsFFmpegLoading] = useState(false);
  const [isFFmpegReady, setIsFFmpegReady] = useState(false);
  const [ffmpegLoadError, setFFmpegLoadError] = useState<string | null>(null);

  const [exportQuality, setExportQuality] = useState<ExportQuality>('medium');

  const inferredDuration = useMemo(() => {
    const d = (audioEnd ?? 0) - (audioStart ?? 0);
    return Number.isFinite(d) && d > 0 ? d : 15; // default 15s if we can't infer
  }, [audioStart, audioEnd]);

  const [videoDuration, setVideoDuration] = useState<number>(inferredDuration);
  useEffect(() => setVideoDuration(inferredDuration), [inferredDuration]);

  // --- Worker
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    const worker = new Worker(new URL('../workers/exportWorker.ts', import.meta.url), {
      type: 'module',
    });
    workerRef.current = worker;

    const onMessage = (e: MessageEvent<WorkerMessage>) => {
      const { type, progress, message, error, videoBlob } = e.data || {};

      switch (type) {
        case 'workerReady':
          setIsWorkerReady(true);
          // ask it to preload ffmpeg
          worker.postMessage({ type: 'initFFmpeg' });
          break;

        case 'ffmpegLoading':
          setIsFFmpegLoading(true);
          setIsFFmpegReady(false);
          setFFmpegLoadError(null);
          setExportError(null);
          break;

        case 'ffmpegLoaded':
          setIsFFmpegLoading(false);
          setIsFFmpegReady(true);
          setFFmpegLoadError(null);
          setExportError(null);
          break;

        case 'ffmpegLoadError':
          setIsFFmpegLoading(false);
          setIsFFmpegReady(false);
          setFFmpegLoadError(error || 'Failed to load the video engine');
          setExportError(error || 'Failed to load the video engine');
          setIsExporting(false);
          break;

        case 'exportProgress':
          if (typeof progress === 'number') setExportProgress(progress);
          if (typeof message === 'string') setExportProgressMessage(message);
          setExportError(null);
          break;

        case 'exportComplete':
          if (videoBlob) {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
            const url = URL.createObjectURL(videoBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `vinyl_animation_${timestamp}.webm`; // download as WEBM
            link.click();
            URL.revokeObjectURL(url);
          }
          setIsExporting(false);
          setExportProgress(100);
          setExportProgressMessage('Done');
          setExportError(null);
          break;

        case 'exportError':
          setIsExporting(false);
          setExportProgress(0);
          const errorMsg = error || 'Export failed';
          setExportProgressMessage(errorMsg);
          setExportError(errorMsg);
          break;

        default:
          break;
      }
    };

    worker.addEventListener('message', onMessage);
    return () => {
      worker.removeEventListener('message', onMessage);
      worker.terminate();
      workerRef.current = null;
    };
  }, []);

  // --- Frame capture (from vinyl DOM)
  const captureFrames = useCallback(
    async (node: HTMLElement, fps: number, seconds: number, pixelRatio: number, imageQuality: number) => {
      const total = Math.max(1, Math.floor(fps * seconds));
      const frames: string[] = [];

      setExportProgress(5);
      setExportProgressMessage('Capturing frames');
      setExportError(null);

      // Calculate rotation increment for smooth animation
      const rotationIncrement = 360 / total;
      for (let i = 0; i < total; i++) {
        // Set the rotation for this frame
        const rotation = (i * rotationIncrement) % 360;
        setCaptureRotation(rotation);
        
        // Small delay to allow DOM to update
        await new Promise(resolve => setTimeout(resolve, 10));
        
        // eslint-disable-next-line no-await-in-loop
        const dataUrl = await toPng(node, { pixelRatio, quality: imageQuality });
        frames.push(dataUrl);

        if (i % Math.max(1, Math.floor(total / 10)) === 0) {
          setExportProgress(5 + Math.round((i / total) * 5)); // 5..10
          setExportProgressMessage('Capturing frames');
          // eslint-disable-next-line no-await-in-loop
          await new Promise((r) => setTimeout(r, 0));
        }
      }
      
      // Reset rotation after capture
      setCaptureRotation(0);
      return frames;
    },
    [setCaptureRotation]
  );

  // --- Start export (keeps your old name)
  const handleExport = useCallback(async () => {
    if (!workerRef.current) {
      const errorMsg = 'Video engine not ready';
      setExportProgressMessage(errorMsg);
      setExportError(errorMsg);
      return;
    }
    if (!vinylRef?.current) {
      const errorMsg = 'Canvas not found';
      setExportProgressMessage(errorMsg);
      setExportError(errorMsg);
      return;
    }
    if (!audioUrl) {
      const errorMsg = 'Please add an audio file';
      setExportProgressMessage(errorMsg);
      setExportError(errorMsg);
      return;
    }

    // Validate audio trim values
    if (audioStart < 0 || audioEnd <= audioStart) {
      const errorMsg = 'Invalid audio selection. Please adjust the trim region.';
      setExportProgressMessage(errorMsg);
      setExportError(errorMsg);
      return;
    }

    const trimmedDuration = audioEnd - audioStart;
    if (trimmedDuration < 1) {
      const errorMsg = 'Selected audio segment is too short. Minimum 1 second required.';
      setExportProgressMessage(errorMsg);
      setExportError(errorMsg);
      return;
    }

    try {
      setIsExporting(true);
      setExportProgress(0);
      setExportProgressMessage('Starting export');
      setExportError(null);

      const settings = EXPORT_SETTINGS[exportQuality];
      const fps = settings.fps;
      const pixelRatio = settings.pixelRatio;
      const imageQuality = settings.imageQuality;

      const node = vinylRef.current as HTMLElement;
      const frames = await captureFrames(node, fps, videoDuration, pixelRatio, imageQuality);

      workerRef.current.postMessage({
        type: 'startExport',
        payload: {
          frames,
          audioBlobUrl: audioUrl,
          videoDuration,
          quality: exportQuality,
          audioStart,
          audioEnd,
        },
      });
    } catch (err) {
      setIsExporting(false);
      setExportProgress(0);
      const errorMsg = 
        err instanceof Error ? err.message : 'Unexpected error during export'
      ;
      setExportProgressMessage(errorMsg);
      setExportError(errorMsg);
    }
  }, [audioUrl, audioStart, audioEnd, captureFrames, exportQuality, videoDuration, vinylRef]);

  const value: ExportContextValue = {
    isExporting,
    exportProgress,
    exportProgressMessage,
    exportError,
    isWorkerReady,
    isFFmpegLoading,
    isFFmpegReady,
    ffmpegLoadError,
    exportQuality,
    setExportQuality,
    videoDuration,
    setVideoDuration,
    handleExport,
  };

  return <ExportContext.Provider value={value}>{children}</ExportContext.Provider>;
};

export const useExportContext = () => {
  const ctx = useContext(ExportContext);
  if (!ctx) throw new Error('useExportContext must be used within an ExportProvider');
  return ctx;
};
