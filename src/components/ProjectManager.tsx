import React, { useState, useEffect } from 'react';
import { Save, FolderOpen, Trash2, X, Loader2, Clock } from 'lucide-react';
import { useProjectContext, useToast } from '../context/AppContext';

const ProjectManager: React.FC = () => {
  const { showToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const {
    projects,
    currentProjectId,
    isLoading,
    isSaving,
    saveProject,
    loadProject,
    deleteProject,
    fetchProjects,
  } = useProjectContext();

  useEffect(() => {
    if (isOpen) {
      fetchProjects();
    }
  }, [isOpen, fetchProjects]);

  const handleSave = async () => {
    if (!projectName.trim()) {
      setSaveError('Please enter a project name');
      return;
    }

    try {
      setSaveError(null);
      await saveProject(projectName);
      setShowSaveDialog(false);
      setProjectName('');
      showToast('Project saved successfully', 'success');
    } catch (error) {
      setSaveError('Failed to save project');
      showToast('Failed to save project', 'error');
    }
  };

  const handleLoad = async (id: string) => {
    try {
      await loadProject(id);
      setIsOpen(false);
      showToast('Project loaded successfully', 'success');
    } catch (error) {
      console.error('Failed to load project:', error);
      showToast('Failed to load project', 'error');
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteProject(id);
        showToast('Project deleted', 'success');
      } catch (error) {
        console.error('Failed to delete project:', error);
        showToast('Failed to delete project', 'error');
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      <div className="flex gap-2">
        <button
          onClick={() => setShowSaveDialog(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all text-sm"
          aria-label="Save project"
        >
          <Save className="w-4 h-4" />
          <span className="hidden sm:inline">Save</span>
        </button>
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all text-sm"
          aria-label="Open projects"
        >
          <FolderOpen className="w-4 h-4" />
          <span className="hidden sm:inline">Projects</span>
        </button>
      </div>

      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-2xl p-6 max-w-md w-full border border-zinc-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Save Project</h3>
              <button
                onClick={() => {
                  setShowSaveDialog(false);
                  setSaveError(null);
                  setProjectName('');
                }}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Enter project name"
              className="w-full px-4 py-3 bg-black/40 rounded-lg border border-zinc-700 focus:border-white/50 outline-none transition-colors"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />

            {saveError && (
              <p className="text-red-400 text-sm mt-2">{saveError}</p>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowSaveDialog(false);
                  setSaveError(null);
                  setProjectName('');
                }}
                className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 px-4 py-2 bg-white text-black hover:bg-white/90 rounded-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col border border-zinc-800">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Your Projects</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-12 text-zinc-500">
                <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No saved projects yet</p>
                <p className="text-sm mt-1">Create your first project by clicking Save</p>
              </div>
            ) : (
              <div className="space-y-2 overflow-y-auto pr-2">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    onClick={() => handleLoad(project.id)}
                    className={`group p-4 rounded-xl border cursor-pointer transition-all hover:border-white/30 ${
                      currentProjectId === project.id
                        ? 'bg-white/10 border-white/30'
                        : 'bg-black/20 border-zinc-800'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{project.name}</h4>
                        <div className="flex items-center gap-3 mt-2 text-xs text-zinc-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(project.updated_at)}
                          </span>
                          <span>
                            {project.settings.rpm} RPM
                          </span>
                          <span>
                            {project.settings.selectedRatio}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleDelete(project.id, e)}
                        className="p-2 hover:bg-red-500/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        aria-label="Delete project"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ProjectManager;
