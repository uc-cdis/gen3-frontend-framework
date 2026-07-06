import React, { useEffect, useRef } from 'react';
import {
  GEN3_WORKSPACE_API,
  selectActiveWorkspaceStatus,
  useCoreSelector,
  WorkspaceStatus,
} from '@gen3/core';
import { ACTIVITY_CHANNEL } from './../../lib/session/constants';

const WorkspaceNotebook = () => {
  const currentWorkspaceStatus = useCoreSelector(selectActiveWorkspaceStatus);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    if (currentWorkspaceStatus !== WorkspaceStatus.Running) return;

    // Initialize BroadcastChannel
    broadcastChannelRef.current = new BroadcastChannel(ACTIVITY_CHANNEL);

    const updateUserActivity = () => {
      const timestamp = Date.now();
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.postMessage({
          type: 'activity-update',
          timestamp,
        });
      }
    };

    // Listen for user activity events on the iframe
    const iframe = iframeRef.current;
    if (iframe?.contentWindow) {
      try {
        // Try to access iframe content (will fail for cross-origin)
        const iframeDoc =
          iframe.contentDocument || iframe.contentWindow.document;

        if (iframeDoc) {
          iframeDoc.addEventListener('mousedown', updateUserActivity);
          iframeDoc.addEventListener('keypress', updateUserActivity);
          iframeDoc.addEventListener('scroll', updateUserActivity);
          iframeDoc.addEventListener('click', updateUserActivity);
          iframeDoc.addEventListener('touchstart', updateUserActivity);
        }
      } catch {
        // Cross-origin iframe - events won't be captured
        // You may need to add a script inside the iframe itself to handle this
        console.warn('Cannot access iframe content - cross-origin restriction');
      }
    }

    return () => {
      if (iframe?.contentWindow) {
        try {
          const iframeDoc =
            iframe.contentDocument || iframe.contentWindow.document;
          if (iframeDoc) {
            iframeDoc.removeEventListener('mousedown', updateUserActivity);
            iframeDoc.removeEventListener('keypress', updateUserActivity);
            iframeDoc.removeEventListener('scroll', updateUserActivity);
            iframeDoc.removeEventListener('click', updateUserActivity);
            iframeDoc.removeEventListener('touchstart', updateUserActivity);
          }
        } catch {
          // Ignore cleanup errors
        }
      }

      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.close();
      }
    };
  }, [currentWorkspaceStatus]);

  return (
    <React.Fragment>
      <div className="flex flex-col w-full h-workspace flex-grow content-center items-center">
        <iframe
          className="w-full h-full border-8"
          title="Workspace"
          src={`${GEN3_WORKSPACE_API}/proxy/`}
        />
      </div>
    </React.Fragment>
  );
};

export default WorkspaceNotebook;
