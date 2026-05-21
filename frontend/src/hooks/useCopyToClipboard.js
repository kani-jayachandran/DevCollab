import { useState, useCallback } from 'react';

/**
 * Returns [copied, copy].
 * `copy(text)` writes to clipboard and sets `copied = true` for 2 seconds.
 */
export function useCopyToClipboard() {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Clipboard write failed:', err);
    }
  }, []);

  return [copied, copy];
}
