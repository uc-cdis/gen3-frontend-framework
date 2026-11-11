import { useCallback, useEffect, useRef } from 'react';
import { ACTIVITY_CHANNEL } from './constants';

/**
 * Minimum gap between activity messages posted for one iframe. The session
 * provider throttles on its side too; this keeps scroll and key repeat from
 * flooding the channel.
 */
export const IFRAME_ACTIVITY_THROTTLE_MILLISECONDS = 1000;

/**
 * Events that count as activity inside the frame. Mirrors the session
 * provider's own list. All are registered in the capture phase: apps such as
 * JupyterLab handle keys and clicks in capture and stop propagation, which hides
 * them from a bubble-phase listener, and `scroll` does not bubble at all.
 * `scroll` and `touchstart` are passive so tracking can never delay scrolling.
 */
const IFRAME_ACTIVITY_EVENTS: ReadonlyArray<
  readonly [type: string, options: AddEventListenerOptions]
> = [
  ['mousedown', { capture: true }],
  ['keydown', { capture: true }],
  ['touchstart', { capture: true, passive: true }],
  ['scroll', { capture: true, passive: true }],
];

/**
 * Forward user activity inside an iframe to the session provider, so that time
 * spent working in an embedded app (a workspace, a notebook) is not mistaken for
 * inactivity. The window's own activity listeners cannot see events that happen
 * inside a frame's document.
 *
 * Returns a function to call from the iframe's `onLoad`. It is called on every
 * load, not once, so listeners follow the frame onto its new document after a
 * reload, a navigation or a remount, and the previous document's listeners are
 * removed.
 *
 * - Same-origin frame: listeners go on the frame's document.
 * - Cross-origin frame (document not reachable): falls back to window
 *   `blur`/`focus`, which fire when the frame takes or gives up focus. That only
 *   catches the user moving in and out of the frame, not what they do inside it.
 * - No `BroadcastChannel` (older Safari, non-DOM environments): does nothing,
 *   the session keeps working without cross-frame activity.
 *
 * @example
 * const forwardActivity = useIframeActivityForwarding();
 * <iframe onLoad={(e) => forwardActivity(e.currentTarget)} />
 */
export const useIframeActivityForwarding = (): ((
  iframe: HTMLIFrameElement | null,
) => void) => {
  const channelRef = useRef<BroadcastChannel | null>(null);
  const detachRef = useRef<(() => void) | null>(null);
  const lastSentRef = useRef(0);

  const detach = useCallback(() => {
    detachRef.current?.();
    detachRef.current = null;
  }, []);

  useEffect(() => {
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        channelRef.current = new BroadcastChannel(ACTIVITY_CHANNEL);
      } catch {
        channelRef.current = null;
      }
    }

    return () => {
      detach();
      channelRef.current?.close();
      channelRef.current = null;
    };
  }, [detach]);

  return useCallback(
    (iframe: HTMLIFrameElement | null) => {
      detach();
      if (!iframe) return;

      const forward = () => {
        const channel = channelRef.current;
        if (!channel) return;

        const now = Date.now();
        if (now - lastSentRef.current < IFRAME_ACTIVITY_THROTTLE_MILLISECONDS)
          return;
        lastSentRef.current = now;

        channel.postMessage({ type: 'activity-update', timestamp: now });
      };

      let doc: Document | null = null;
      try {
        doc = iframe.contentDocument ?? iframe.contentWindow?.document ?? null;
      } catch {
        // cross-origin: the document is not reachable
      }

      if (doc) {
        const target = doc;
        IFRAME_ACTIVITY_EVENTS.forEach(([type, options]) =>
          target.addEventListener(type, forward, options),
        );
        detachRef.current = () => {
          try {
            IFRAME_ACTIVITY_EVENTS.forEach(([type, options]) =>
              target.removeEventListener(type, forward, options),
            );
          } catch {
            // the document is already gone
          }
        };
        return;
      }

      window.addEventListener('blur', forward);
      window.addEventListener('focus', forward);
      detachRef.current = () => {
        window.removeEventListener('blur', forward);
        window.removeEventListener('focus', forward);
      };
    },
    [detach],
  );
};
