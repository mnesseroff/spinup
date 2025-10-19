import React, { useEffect, useRef } from 'react';
import Vinyl from '../components/Vinyl';
import AudioControls from '../components/AudioControls';
import KeyboardShortcutsHelp from '../components/KeyboardShortcutsHelp';
import { useAudioContext, useExportContext } from '../context/AppContext';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

const Home = () => {
  const { togglePlayPause, audioUrl } = useAudioContext();
  const { handleExport, isExporting, isFFmpegReady, isWorkerReady } = useExportContext();
  const saveButtonRef = useRef<HTMLButtonElement>(null);
  const projectsButtonRef = useRef<HTMLButtonElement>(null);

  useKeyboardShortcuts([
    {
      key: ' ',
      callback: () => {
        if (audioUrl) togglePlayPause();
      },
      description: 'Play/Pause audio',
    },
    {
      key: 's',
      ctrlKey: true,
      callback: () => {
        saveButtonRef.current?.click();
      },
      description: 'Save project',
    },
    {
      key: 'o',
      ctrlKey: true,
      callback: () => {
        projectsButtonRef.current?.click();
      },
      description: 'Open projects',
    },
    {
      key: 'e',
      ctrlKey: true,
      callback: () => {
        if (!isExporting && isFFmpegReady && isWorkerReady && audioUrl) {
          handleExport();
        }
      },
      description: 'Export video',
    },
  ]);

  useEffect(() => {
    const header = document.querySelector('header');
    if (header) {
      const saveBtn = header.querySelector('[aria-label="Save project"]') as HTMLButtonElement;
      const projectsBtn = header.querySelector('[aria-label="Open projects"]') as HTMLButtonElement;
      if (saveBtn) saveButtonRef.current = saveBtn;
      if (projectsBtn) projectsButtonRef.current = projectsBtn;
    }
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8 md:mb-16">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-3">
          Create Stunning Music Visuals
        </h1>
        <p className="text-lg md:text-xl text-white/80">
          Transform your music into beautiful spinning animations
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-start">
        <div className="space-y-6 order-2 lg:order-1">
          <Vinyl className="max-w-sm mx-auto lg:max-w-full" />
        </div>
        <div className="order-1 lg:order-2">
          <AudioControls />
        </div>
      </div>
      <KeyboardShortcutsHelp />
    </div>
  );
};

export default Home;