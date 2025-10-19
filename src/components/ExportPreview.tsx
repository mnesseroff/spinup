import React from 'react';
import { AspectRatio, ExportQuality } from '../Types';

interface ExportPreviewProps {
  quality: ExportQuality | undefined;
  ratio: AspectRatio | undefined;
  duration: number | undefined;
  className?: string;
}

const LABELS: Record<ExportQuality, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

const RES_BY_RATIO: Record<AspectRatio, string> = {
  '9x16': '1080 × 1920',
  '4x5': '1080 × 1350',
  '1x1': '1080 × 1080',
};

const ExportPreview: React.FC<ExportPreviewProps> = ({
  quality,
  ratio,
  duration,
  className = '',
}) => {
  const q: ExportQuality = (quality ?? 'medium') as ExportQuality;
  const r: AspectRatio = (ratio ?? '1x1') as AspectRatio;
  const d: number = Number.isFinite(duration as number) ? (duration as number) : 15;

  return (
    <div className={`rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 ${className}`}>
      <div className="mb-3">
        <h3 className="text-sm font-medium text-white">Export Settings</h3>
        <p className="text-xs text-zinc-400">Preview of your video output</p>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-zinc-400">Quality:</span>
          <span className="text-white">{LABELS[q]}</span>
        </div>

        <div className="flex justify-between text-xs">
          <span className="text-zinc-400">Aspect Ratio:</span>
          <span className="text-white">{r}</span>
        </div>

        <div className="flex justify-between text-xs">
          <span className="text-zinc-400">Resolution:</span>
          <span className="text-white">{RES_BY_RATIO[r]}</span>
        </div>

        <div className="flex justify-between text-xs">
          <span className="text-zinc-400">Duration:</span>
          <span className="text-white">{d} seconds</span>
        </div>

        <div className="flex justify-between text-xs">
          <span className="text-zinc-400">Format:</span>
          <span className="text-white">WebM (VP9 + Opus)</span>
        </div>

        <div className="text-[11px] text-zinc-500">
          Uses constant‑quality encoding. File size varies with visuals and duration.
        </div>
      </div>
    </div>
  );
};

export default ExportPreview;
