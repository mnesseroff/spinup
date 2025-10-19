import { ExportQuality } from '../Types'; // Assuming ExportQuality is defined in Types/index.ts

type QualitySettings = {
  fps: number;
  videoBitrate: string;
  audioBitrate: string;
  ffmpegPreset: 'ultrafast' | 'superfast' | 'veryfast' | 'faster' | 'fast' | 'medium' | 'slow' | 'slower' | 'veryslow';
  imageQuality: number; // 0 to 1 for toPng quality
  pixelRatio: number;   // Pixel ratio for toPng
};

export const EXPORT_SETTINGS: Record<ExportQuality, QualitySettings> = {
  low: {
    fps: 24,
    videoBitrate: '1.5M',
    audioBitrate: '128k',
    ffmpegPreset: 'fast',
    imageQuality: 0.85,
    pixelRatio: 1.25,
  },
  medium: {
    fps: 30,
    videoBitrate: '3M',
    audioBitrate: '192k',
    ffmpegPreset: 'medium',
    imageQuality: 0.92,
    pixelRatio: 1.75,
  },
  high: {
    fps: 60,
    videoBitrate: '6M',
    audioBitrate: '320k',
    ffmpegPreset: 'slow',
    imageQuality: 0.98,
    pixelRatio: 2.5,
  },
}; 