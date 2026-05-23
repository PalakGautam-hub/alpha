import { useEffect, useCallback } from 'react';

interface ShortcutOptions {
  key: string;
  metaKey?: boolean;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  callback: () => void;
  enabled?: boolean;
}

/**
 * Register a keyboard shortcut globally.
 */
export function useKeyboardShortcut({
  key,
  metaKey = false,
  ctrlKey = false,
  shiftKey = false,
  callback,
  enabled = true,
}: ShortcutOptions) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;
      const isMetaMatch = !metaKey || e.metaKey;
      const isCtrlMatch = !ctrlKey || e.ctrlKey;
      const isShiftMatch = !shiftKey || e.shiftKey;
      const isKeyMatch = e.key.toLowerCase() === key.toLowerCase();

      if (isMetaMatch && isCtrlMatch && isShiftMatch && isKeyMatch) {
        e.preventDefault();
        callback();
      }
    },
    [key, metaKey, ctrlKey, shiftKey, callback, enabled]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
