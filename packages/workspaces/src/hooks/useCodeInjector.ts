import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Hook that provides code injection into a same-origin JupyterLab iframe.
 * Finds the active CodeMirror cell and inserts text programmatically.
 *
 * Caches the last-known active CM6 EditorView so that clicking "Insert"
 * in the sidebar (which steals focus from the iframe) still targets the
 * correct cell.
 */
export function useCodeInjector() {
  const [iframeReady, setIframeReady] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const lastEditorRef = useRef<HTMLElement | null>(null);

  // Poll for the JupyterLab iframe and cache the active editor view
  useEffect(() => {
    const check = () => {
      const iframe = document.querySelector<HTMLIFrameElement>(
        'iframe[src*="/lab"]',
      );
      iframeRef.current = iframe ?? null;
      if (iframe) {
        try {
          const doc = iframe.contentDocument ?? iframe.contentWindow?.document;
          setIframeReady(!!doc);
          // Cache the active cell's CM6 EditorView while focus info is fresh
          if (doc) {
            const activeCell = doc.querySelector('.jp-Cell.jp-mod-active');
            if (activeCell) {
              const cmContent = activeCell.querySelector('.cm-content');
              const view = cmContent?.cmView?.view;
              if (view) {
                lastEditorRef.current = view;
              }
            }
          }
        } catch {
          setIframeReady(false);
        }
      } else {
        setIframeReady(false);
      }
    };

    check();
    const interval = setInterval(check, 1000);
    return () => clearInterval(interval);
  }, []);

  const insertCode = useCallback((code: string): boolean => {
    // Re-acquire iframe if the cached reference is detached
    const iframe = iframeRef.current?.isConnected
      ? iframeRef.current
      : document.querySelector<HTMLIFrameElement>('iframe[src*="/lab"]');
    if (!iframe) return false;

    try {
      const iframeDoc =
        iframe.contentDocument ?? iframe.contentWindow?.document;
      if (!iframeDoc) return false;

      // Strategy 1: Find active cell's CodeMirror 6 editor view
      const activeCell = iframeDoc.querySelector('.jp-Cell.jp-mod-active');
      const cmContent = (activeCell ?? iframeDoc).querySelector(
        '.cm-content',
      ) as HTMLElement | null;

      let cmView: any = null;
      if (cmContent) {
        cmView = (cmContent as any)?.cmView?.view ?? null;
      }

      // Fall back to the cached editor when the click stole focus from the iframe
      if (!cmView && lastEditorRef.current) {
        cmView = lastEditorRef.current;
      }

      if (cmView) {
        // Update the cache to the editor we're actually inserting into
        lastEditorRef.current = cmView;
        const { state } = cmView;
        const cursor = state.selection.main.head;
        cmView.dispatch({
          changes: { from: cursor, insert: code },
          selection: { anchor: cursor + code.length },
        });
        return true;
      }

      if (cmContent) {
        // Fallback: use execCommand-based insertion (works in contenteditable)
        cmContent.focus();
        const selection = iframe.contentWindow?.getSelection();
        if (selection) {
          // Move cursor to end
          selection.selectAllChildren(cmContent);
          selection.collapseToEnd();
        }

        // Use insertText command for undo support
        const inserted = iframeDoc.execCommand('insertText', false, code);
        if (inserted) return true;

        // Last resort: direct text manipulation
        cmContent.textContent = (cmContent.textContent ?? '') + code;
        cmContent.dispatchEvent(new Event('input', { bubbles: true }));
        return true;
      }

      // Strategy 2: Find any focused textarea (JupyterLite or classic notebook)
      const textarea = iframeDoc.querySelector(
        'textarea:focus',
      ) as HTMLTextAreaElement | null;
      if (textarea) {
        const start = textarea.selectionStart ?? textarea.value.length;
        textarea.value =
          textarea.value.slice(0, start) + code + textarea.value.slice(start);
        textarea.selectionStart = textarea.selectionEnd = start + code.length;
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        return true;
      }

      return false;
    } catch {
      return false;
    }
  }, []);

  return { insertCode, iframeReady };
}
