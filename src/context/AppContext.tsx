import React from 'react';
import { AudioProvider } from './AudioContext';
import { VinylProvider } from './VinylContext';
import { ExportProvider } from './ExportContext';
import { ProjectProvider } from './ProjectContext';
import { ToastProvider } from './ToastContext';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ToastProvider>
      <VinylProvider>
        <AudioProvider>
          <ExportProvider>
            <ProjectProvider>
              {children}
            </ProjectProvider>
          </ExportProvider>
        </AudioProvider>
      </VinylProvider>
    </ToastProvider>
  );
};

export { useAudioContext } from './AudioContext';
export { useVinylContext } from './VinylContext';
export { useExportContext } from './ExportContext';
export { useProjectContext } from './ProjectContext';
export { useToast } from './ToastContext';