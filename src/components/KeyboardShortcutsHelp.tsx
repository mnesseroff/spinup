import React, { useState } from 'react';
import { Keyboard, X } from 'lucide-react';

interface Shortcut {
  keys: string;
  description: string;
}

const shortcuts: Shortcut[] = [
  { keys: 'Space', description: 'Play/Pause audio' },
  { keys: '⌘/Ctrl + S', description: 'Save project' },
  { keys: '⌘/Ctrl + O', description: 'Open projects' },
  { keys: '⌘/Ctrl + E', description: 'Export video' },
  { keys: '?', description: 'Show keyboard shortcuts' },
];

const KeyboardShortcutsHelp: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all shadow-lg backdrop-blur-sm z-40"
        aria-label="Show keyboard shortcuts"
        title="Keyboard shortcuts (?)"
      >
        <Keyboard className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-2xl p-6 max-w-md w-full border border-zinc-800">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Keyboard Shortcuts</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {shortcuts.map((shortcut, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 border-b border-zinc-800 last:border-0"
                >
                  <span className="text-zinc-400 text-sm">{shortcut.description}</span>
                  <kbd className="px-3 py-1 bg-black/40 rounded-lg text-xs font-mono border border-zinc-700">
                    {shortcut.keys}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default KeyboardShortcutsHelp;
