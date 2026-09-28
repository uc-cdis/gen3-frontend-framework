// hooks/useIframeAutoFit.ts
import { useCallback, useEffect, useRef } from 'react';
import { useDebouncedCallback, useResizeObserver } from '@mantine/hooks';

export type NudgeFn = (frameWindow: Window) => void;

export interface UseIframeAutoFitOptions {
  /** Called with the iframe's contentWindow whenever the wrapper resizes. */
  onNudge: NudgeFn;
  /** Debounce delay in ms — collapses rapid resize events (e.g. mid-CSS-transition) into one nudge. */
  debounceMs?: number;
}

export interface UseIframeAutoFitResult {
  /** Attach to the OUTER wrapper element (the one whose size drives the iframe). */
  wrapperRef: (element: HTMLElement | null) => void;
  /** Attach to the <iframe> itself. */
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
  /** Call this directly, e.g. from the iframe's onLoad handler. */
  nudgeNow: () => void;
}

export function useIframeAutoFit({
  onNudge,
  debounceMs = 50,
}: UseIframeAutoFitOptions): UseIframeAutoFitResult {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [wrapperRef, wrapperRect] = useResizeObserver();

  const nudgeNow = useCallback(() => {
    const frameWindow = iframeRef.current?.contentWindow;
    if (!frameWindow) return;
    try {
      onNudge(frameWindow);
    } catch {
      // cross-origin guard, or the embedded app isn't ready yet — ignore
    }
  }, [onNudge]);

  const debouncedNudge = useDebouncedCallback(nudgeNow, debounceMs);

  useEffect(() => {
    if (wrapperRect.width || wrapperRect.height) {
      debouncedNudge();
    }
  }, [wrapperRect.width, wrapperRect.height, debouncedNudge]);

  return { wrapperRef, iframeRef, nudgeNow };
}
