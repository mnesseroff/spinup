import React from 'react';
import { Upload, Volume2, Play, Pause, Download, Loader2, X } from 'lucide-react';
import { useAudioContext, useVinylContext, useExportContext } from '../context/AppContext';
import ProgressBar from './ProgressBar';
import ExportPreview from './ExportPreview';
import AudioTrimmer from './AudioTrimmer';
import AudioWaveform from './AudioWaveform';

const AudioControls = () => {
  const {
    audioUrl,
    audioFileName,
    isPlaying,
    waveformRef,
    handleAudioUpload,
    handleRemoveAudio,
    togglePlayPause
  } = useAudioContext();

  const {
    labelUrl,
    labelFileName,
    rpm,
    labelSize,
    spinDirection,
    selectedRatio,
    handleLabelUpload,
    handleRemoveLabel,
    setRpm,
    setLabelSize,
    setSpinDirection,
    setSelectedRatio
  } = useVinylContext();

  const {
    isExporting,
    exportProgress,
    exportProgressMessage,
    exportQuality,
    videoDuration,
    handleExport,
    setVideoDuration,
    setExportQuality,
    isWorkerReady,
    isFFmpegReady,
    isFFmpegLoading,
    exportError
  } = useExportContext();

  const aspectRatioLabels = {
    '9x16': 'Vertical',
    '4x5': 'Portrait',
    '1x1': 'Square'
  };

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <div>
          <label className="text-sm text-zinc-400 mb-3 block" id="label-upload">Upload Label Image</label>
          <label 
            htmlFor="label-upload-input"
            className={`group relative flex items-center justify-center w-full h-32 rounded-xl border border-dashed transition-all cursor-pointer bg-black/20 ${labelUrl ? 'border-brand' : 'border-zinc-700 hover:border-zinc-600'}`}
            aria-labelledby="label-upload"
          >
            <input
              id="label-upload-input"
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleLabelUpload}
              className="hidden"
              aria-labelledby="label-upload"
            />
            <div className="text-center">
              {labelUrl ? (
                <div className="flex flex-col items-center">
                  <div 
                    className="w-16 h-16 rounded-full bg-cover bg-center mb-2" 
                    style={{ backgroundImage: `url(${labelUrl})` }}
                    role="img"
                    aria-label="Uploaded label preview"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-brand">{labelFileName}</span>
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        handleRemoveLabel();
                      }}
                      className="p-1 hover:bg-white/10 rounded-full transition-colors"
                      aria-label="Remove label image"
                    >
                      <X className="w-4 h-4 text-zinc-400 hover:text-white" />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <Upload className="w-6 h-6 mx-auto mb-2 text-zinc-500 group-hover:text-zinc-400" />
                  <span className="text-sm text-zinc-500 group-hover:text-zinc-400">
                    Choose Image
                  </span>
                </>
              )}
            </div>
          </label>
        </div>

        <div>
          <label className="text-sm text-zinc-400 mb-3 block" id="audio-upload">Upload Audio Track</label>
          <label 
            htmlFor="audio-upload-input"
            className={`group relative flex items-center justify-center w-full h-32 rounded-xl border border-dashed transition-all cursor-pointer bg-black/20 ${audioUrl ? 'border-brand' : 'border-zinc-700 hover:border-zinc-600'}`}
            aria-labelledby="audio-upload"
          >
            <input
              id="audio-upload-input"
              type="file"
              accept=".mp3,.wav,.aif,.aiff"
              onChange={handleAudioUpload}
              className="hidden"
              aria-labelledby="audio-upload"
            />
            <div className="text-center">
              {audioUrl ? (
                <div className="flex flex-col items-center">
                  <Volume2 className="w-8 h-8 mb-2 text-brand" />
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-brand">{audioFileName}</span>
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        handleRemoveAudio();
                      }}
                      className="p-1 hover:bg-white/10 rounded-full transition-colors"
                      aria-label="Remove audio file"
                    >
                      <X className="w-4 h-4 text-zinc-400 hover:text-white" />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <Volume2 className="w-6 h-6 mx-auto mb-2 text-zinc-500 group-hover:text-zinc-400" />
                  <span className="text-sm text-zinc-500 group-hover:text-zinc-400">
                    Choose Audio (MP3, WAV, AIF)
                  </span>
                </>
              )}
            </div>
          </label>
        </div>

        {audioUrl && (
          <div className="space-y-6">
            <div className="space-y-6 bg-black/20 p-6 rounded-xl">
              <div className="flex items-center gap-4">
                <button
                  onClick={togglePlayPause}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-all flex items-center justify-center"
                  aria-label={isPlaying ? "Pause audio" : "Play audio"}
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4 ml-0.5" />
                  )}
                </button>
                <div className="flex-1 h-16 bg-black/40 rounded-lg relative" ref={waveformRef}>
                  <AudioWaveform />
                </div>
              </div>
            </div>

            <AudioTrimmer maxDuration={60} isPro={false} />
          </div>
        )}

        <div className="space-y-8 pt-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <label htmlFor="rpm-slider" className="text-sm text-zinc-400">Rotation Speed</label>
              <span className="text-xs text-zinc-500">{rpm} RPM</span>
            </div>
            <input
              id="rpm-slider"
              type="range"
              min="5"
              max="30"
              step="1"
              value={rpm}
              onChange={(e) => setRpm(Number(e.target.value))}
              className="w-full accent-white"
              aria-label={`Set rotation speed: ${rpm} RPM`}
            />
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <label htmlFor="size-slider" className="text-sm text-zinc-400">Label Size</label>
              <span className="text-xs text-zinc-500">{labelSize}%</span>
            </div>
            <input
              id="size-slider"
              type="range"
              min="20"
              max="60"
              value={labelSize}
              onChange={(e) => setLabelSize(Number(e.target.value))}
              className="w-full accent-white"
              aria-label={`Set label size: ${labelSize}%`}
            />
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <label htmlFor="duration-slider" className="text-sm text-zinc-400">Video Duration</label>
              <span className="text-xs text-zinc-500">{videoDuration}s</span>
            </div>
            <input
              id="duration-slider"
              type="range"
              min="5"
              max="60"
              value={videoDuration}
              onChange={(e) => setVideoDuration(Number(e.target.value))}
              className="w-full accent-white"
              aria-label={`Set video duration: ${videoDuration} seconds`}
            />
          </div>

          <div>
            <label className="text-sm text-zinc-400 mb-3 block">Direction</label>
            <div className="flex gap-3" role="radiogroup" aria-label="Spin direction">
              <button
                onClick={() => setSpinDirection('normal')}
                className={`flex-1 py-2 rounded-lg text-sm transition-all ${
                  spinDirection === 'normal'
                    ? 'bg-white/10 text-white'
                    : 'bg-white/5 text-zinc-400 hover:bg-white/10'
                }`}
                role="radio"
                aria-checked={spinDirection === 'normal'}
              >
                Clockwise
              </button>
              <button
                onClick={() => setSpinDirection('reverse')}
                className={`flex-1 py-2 rounded-lg text-sm transition-all ${
                  spinDirection === 'reverse'
                    ? 'bg-white/10 text-white'
                    : 'bg-white/5 text-zinc-400 hover:bg-white/10'
                }`}
                role="radio"
                aria-checked={spinDirection === 'reverse'}
              >
                Counter-clockwise
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm text-zinc-400 mb-3 block">Aspect Ratio</label>
            <div className="flex gap-3" role="radiogroup" aria-label="Aspect ratio">
              {(['9x16', '4x5', '1x1'] as const).map((ratio) => (
                <button
                  key={ratio}
                  onClick={() => setSelectedRatio(ratio)}
                  className={`flex-1 py-2 rounded-lg text-sm transition-all ${
                    selectedRatio === ratio
                      ? 'bg-white/10 text-white'
                      : 'bg-white/5 text-zinc-400 hover:bg-white/10'
                  }`}
                  role="radio"
                  aria-checked={selectedRatio === ratio}
                >
                  {aspectRatioLabels[ratio]}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="text-sm text-zinc-400 mb-3 block">Export Quality</label>
            <div className="flex gap-3" role="radiogroup" aria-label="Export quality">
              {(['low', 'medium', 'high'] as const).map((quality) => (
                <button
                  key={quality}
                  onClick={() => setExportQuality(quality)}
                  className={`flex-1 py-2 rounded-lg text-sm transition-all ${
                    exportQuality === quality
                      ? 'bg-white/10 text-white'
                      : 'bg-white/5 text-zinc-400 hover:bg-white/10'
                  }`}
                  role="radio"
                  aria-checked={exportQuality === quality}
                >
                  {quality.charAt(0).toUpperCase() + quality.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <ExportPreview
            quality={exportQuality}
            ratio={selectedRatio}
            duration={videoDuration}
            className="mt-4"
          />

          <button
            onClick={handleExport}
            disabled={isExporting || !isWorkerReady || isFFmpegLoading || !isFFmpegReady || !labelUrl || !audioUrl}
            className={`w-full py-3 rounded-lg font-medium text-center flex items-center justify-center gap-2 transition-all ${
              isExporting || !isWorkerReady || isFFmpegLoading || !isFFmpegReady || !labelUrl || !audioUrl
                ? 'bg-zinc-800/50 text-zinc-500 cursor-not-allowed'
                : 'bg-brand text-white hover:bg-brand/90'
            }`}
            aria-busy={isExporting}
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Exporting ({exportProgress}%)
              </>
            ) : isFFmpegLoading || !isWorkerReady ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading Tools...
              </>
            ) : !isFFmpegReady ? (
                 "Export Tools Loading Error"
            ) : !labelUrl || !audioUrl ? (
              "Upload Audio & Label to Export"
            ) : (
              <>
                <Download className="w-4 h-4" />
                Export Video
              </>
            )}
          </button>
          
          {(isExporting || exportError) && (
            <div className="mt-4 space-y-2">
              {isExporting && (
                  <ProgressBar 
                    progress={exportProgress} 
                    showPercentage={false}
                    height={12}
                    color="bg-brand"
                  />
              )}
              <p className={`text-xs text-center ${exportError ? 'text-red-400' : 'text-zinc-400'}`}>
                 {exportError ? `Error: ${exportError}` : exportProgressMessage}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AudioControls;