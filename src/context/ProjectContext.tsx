import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { supabase, ProjectSettings } from '../lib/supabase';
import { getBrowserFingerprint } from '../utils/browserFingerprint';
import { useVinylContext } from './VinylContext';
import { useAudioContext } from './AudioContext';
import { useExportContext } from './ExportContext';

interface Project {
  id: string;
  name: string;
  audio_url: string | null;
  label_url: string | null;
  settings: ProjectSettings;
  created_at: string;
  updated_at: string;
}

interface ProjectContextType {
  projects: Project[];
  currentProjectId: string | null;
  isLoading: boolean;
  isSaving: boolean;
  saveProject: (name: string) => Promise<void>;
  loadProject: (id: string) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  fetchProjects: () => Promise<void>;
  setCurrentProjectId: (id: string | null) => void;
}

const ProjectContext = createContext<ProjectContextType | null>(null);

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const vinyl = useVinylContext();
  const audio = useAudioContext();
  const exportCtx = useExportContext();

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const userId = getBrowserFingerprint();

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveProject = useCallback(async (name: string) => {
    setIsSaving(true);
    try {
      const userId = getBrowserFingerprint();

      const settings: ProjectSettings = {
        rpm: vinyl.rpm,
        spinDirection: vinyl.spinDirection,
        selectedRatio: vinyl.selectedRatio,
        labelSize: vinyl.labelSize,
        audioStart: audio.audioStart,
        audioEnd: audio.audioEnd,
        videoDuration: exportCtx.videoDuration,
        exportQuality: exportCtx.exportQuality,
      };

      if (currentProjectId) {
        const { error } = await supabase
          .from('projects')
          .update({
            name,
            settings,
            updated_at: new Date().toISOString(),
          })
          .eq('id', currentProjectId);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('projects')
          .insert({
            user_id: userId,
            name,
            settings,
          })
          .select()
          .single();

        if (error) throw error;
        if (data) setCurrentProjectId(data.id);
      }

      await fetchProjects();
    } catch (error) {
      console.error('Failed to save project:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [currentProjectId, vinyl, audio, exportCtx, fetchProjects]);

  const loadProject = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Project not found');

      const settings = data.settings as ProjectSettings;

      vinyl.setRpm(settings.rpm);
      vinyl.setSpinDirection(settings.spinDirection);
      vinyl.setSelectedRatio(settings.selectedRatio);
      vinyl.setLabelSize(settings.labelSize);
      audio.setAudioStart(settings.audioStart);
      audio.setAudioEnd(settings.audioEnd);
      exportCtx.setVideoDuration(settings.videoDuration);
      exportCtx.setExportQuality(settings.exportQuality);

      setCurrentProjectId(id);
    } catch (error) {
      console.error('Failed to load project:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [vinyl, audio, exportCtx]);

  const deleteProject = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;

      if (currentProjectId === id) {
        setCurrentProjectId(null);
      }

      await fetchProjects();
    } catch (error) {
      console.error('Failed to delete project:', error);
      throw error;
    }
  }, [currentProjectId, fetchProjects]);

  const value: ProjectContextType = {
    projects,
    currentProjectId,
    isLoading,
    isSaving,
    saveProject,
    loadProject,
    deleteProject,
    fetchProjects,
    setCurrentProjectId,
  };

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
};

export const useProjectContext = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjectContext must be used within a ProjectProvider');
  }
  return context;
};
