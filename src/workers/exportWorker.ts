/// <reference types="@ffmpeg/ffmpeg" />
/// <reference types="@ffmpeg/util" />

import { loadFFmpeg } from '../utils/ffmpeg';
import { EXPORT_SETTINGS } from '../config/exportSettings';

let ffmpeg: any | null = null;
let isFFmpegLoading = false;
let ffmpegLoadPromise: Promise<any> | null = null;

async function getFFmpeg(): Promise<any> {
  if (ffmpeg) return ffmpeg;
  if (isFFmpegLoading && ffmpegLoadPromise) return ffmpegLoadPromise;

  isFFmpegLoading = true;
  postMessage({ type: 'ffmpegLoading', message: 'Loading video engine…' });

  ffmpegLoadPromise = (async () => {
    try {
      const instance = await loadFFmpeg();
      ffmpeg = instance;

      ffmpeg.on('log', ({ message }: { message: string }) => {
        // Uncomment for debug:
        // console.log('FFmpeg:', message);
      });

      postMessage({ type: 'ffmpegLoaded', message: 'Video engine ready' });
      return ffmpeg;
    } catch (err) {
      postMessage({
        type: 'ffmpegLoadError',
        error:
          err instanceof Error ? err.message : 'Failed to load FFmpeg in the worker.',
      });
      throw err;
    } finally {
      isFFmpegLoading = false;
    }
  })();

  return ffmpegLoadPromise;
}

self.onmessage = async (e: MessageEvent) => {
  const { type, payload } = e.data || {};

  if (type === 'initFFmpeg') {
    try {
      await getFFmpeg();
    } catch {
      // error already posted
    }
    return;
  }

  if (type === 'startExport') {
    if (!payload) {
      postMessage({ type: 'exportError', error: 'No export payload received.' });
      return;
    }

    try {
      const ffmpegInstance = await getFFmpeg();
      const { frames, audioBlobUrl, videoDuration, quality, audioStart, audioEnd } = payload;

      if (!frames || !frames.length) throw new Error('No frames provided.');
      if (!audioBlobUrl) throw new Error('No audio provided.');

      postMessage({ type: 'exportProgress', progress: 10, message: 'Preparing files…' });

      const fetchFileFn =
        (self as any).fetchFile || (await import('@ffmpeg/util')).fetchFile;

      // Write frames
      for (let i = 0; i < frames.length; i++) {
        const fileName = `frame_${i.toString().padStart(6, '0')}.png`;
        await ffmpegInstance.writeFile(fileName, await fetchFileFn(frames[i]));
        if (i % 10 === 0) {
          const p = 10 + Math.round(((i + 1) / frames.length) * 50); // 10→60
          postMessage({ type: 'exportProgress', progress: p, message: 'Processing frames…' });
        }
      }

      // Write audio
      postMessage({ type: 'exportProgress', progress: 60, message: 'Processing audio…' });
      await ffmpegInstance.writeFile('audio_full.mp3', await fetchFileFn(audioBlobUrl));

      const settings = EXPORT_SETTINGS[quality];
      if (!settings) throw new Error(`Invalid export quality: ${quality}`);

      // Trim audio if start/end are provided
      const hasAudioTrim = typeof audioStart === 'number' && typeof audioEnd === 'number' && audioStart >= 0 && audioEnd > audioStart;

      if (hasAudioTrim) {
        postMessage({ type: 'exportProgress', progress: 62, message: 'Trimming audio…' });
        const audioDuration = audioEnd - audioStart;

        // Trim the audio using FFmpeg
        await ffmpegInstance.exec([
          '-i', 'audio_full.mp3',
          '-ss', `${audioStart}`,
          '-t', `${audioDuration}`,
          '-c', 'copy',
          'audio.mp3'
        ]);

        // Clean up full audio
        try {
          await ffmpegInstance.deleteFile('audio_full.mp3');
        } catch {}
      } else {
        // No trimming, just rename the file
        const audioData = await ffmpegInstance.readFile('audio_full.mp3');
        await ffmpegInstance.writeFile('audio.mp3', audioData);
        try {
          await ffmpegInstance.deleteFile('audio_full.mp3');
        } catch {}
      }

      postMessage({ type: 'exportProgress', progress: 65, message: 'Encoding video…' });

      // WEBM (VP9 + Opus) — works with stock ffmpeg.wasm
      const ffmpegCommand = [
        '-framerate', `${settings.fps}`,
        '-i', 'frame_%06d.png',
        '-i', 'audio.mp3',
        '-t', `${videoDuration}`,
        '-c:v', 'libvpx-vp9',
        '-pix_fmt', 'yuv420p',
        '-crf', '28',      // quality target (lower = better)
        '-b:v', '0',       // constrained quality
        '-c:a', 'libopus',
        '-b:a', settings.audioBitrate,
        '-shortest',
        'output.webm',
      ];

      ffmpegInstance.on('progress', ({ progress }: { progress: number }) => {
        const pct = 65 + Math.round(progress * 30); // 65→95
        postMessage({ type: 'exportProgress', progress: pct, message: 'Encoding video…' });
      });

      await ffmpegInstance.exec(ffmpegCommand);

      postMessage({ type: 'exportProgress', progress: 95, message: 'Finalizing…' });

      const data = await ffmpegInstance.readFile('output.webm');
      const videoBlob = new Blob([data], { type: 'video/webm' });

      // Clean up (best effort)
      try {
        for (let i = 0; i < frames.length; i++) {
          await ffmpegInstance.deleteFile(`frame_${i.toString().padStart(6, '0')}.png`);
        }
        await ffmpegInstance.deleteFile('audio.mp3');
        await ffmpegInstance.deleteFile('output.webm');
      } catch {}

      postMessage({ type: 'exportComplete', videoBlob });
    } catch (error) {
      console.error('WORKER: Export error', error);
      postMessage({
        type: 'exportError',
        error: error instanceof Error ? error.message : 'Unknown error during export.',
      });
    }
  }
};

// Signal that the worker booted
postMessage({ type: 'workerReady' });
