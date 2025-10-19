import { useEffect } from 'react';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  callback: () => void;
  description: string;
}

export const useKeyboardShortcuts = (shortcuts: KeyboardShortcut[]) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const keyMatches = e.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatches = shortcut.ctrlKey ? e.ctrlKey : !e.ctrlKey;
        const metaMatches = shortcut.metaKey ? e.metaKey : !e.metaKey;
        const shiftMatches = shortcut.shiftKey ? e.shiftKey : !e.shiftKey;

        if (keyMatches && ctrlMatches && metaMatches && shiftMatches) {
          e.preventDefault();
          shortcut.callback();
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
};

export const getShortcutLabel = (shortcut: Pick<KeyboardShortcut, 'key' | 'ctrlKey' | 'metaKey' | 'shiftKey'>) => {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const parts: string[] = [];

  if (shortcut.ctrlKey || shortcut.metaKey) {
    parts.push(isMac ? '⌘' : 'Ctrl');
  }
  if (shortcut.shiftKey) {
    parts.push('⇧');
  }
  parts.push(shortcut.key.toUpperCase());

  return parts.join('+');
};
