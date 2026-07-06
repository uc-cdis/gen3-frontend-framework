import React, { useEffect, useRef, useState } from 'react';
import {
  GEN3_WORKSPACE_API,
  selectActiveWorkspaceStatus,
  useCoreSelector,
} from '@gen3/core';
import { ACTIVITY_CHANNEL } from './../../lib/session/constants';

const WorkspaceNotebook = () => {
  const currentWorkspaceStatus = useCoreSelector(selectActiveWorkspaceStatus);
  const [jupyterReady, setJupyterReady] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  // set up BroadcastChannel
  useEffect(() => {
    if (!broadcastChannelRef?.current) {
      broadcastChannelRef.current = new BroadcastChannel(ACTIVITY_CHANNEL);
    }

    return () => {
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.close();
        broadcastChannelRef.current = null;
      }
    };
  }, []);

  // Handle setting up iframe event listeners
  useEffect(() => {
    if (!jupyterReady) return;

    const updateUserActivity = () => {
      const timestamp = Date.now();
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.postMessage({
          type: 'activity-update',
          timestamp,
        });
      }
    };

    const iframe = iframeRef.current;
    if (!iframe?.contentWindow) {
      return;
    }

    try {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

      if (iframeDoc) {
        iframeDoc.addEventListener('mousedown', updateUserActivity);
        iframeDoc.addEventListener('keypress', updateUserActivity);
        iframeDoc.addEventListener('scroll', updateUserActivity);
        iframeDoc.addEventListener('click', updateUserActivity);
        iframeDoc.addEventListener('touchstart', updateUserActivity);
      }
    } catch (error) {
      console.warn(
        'Cannot access iframe content - cross-origin restriction',
        error,
      );
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
    };
  }, [jupyterReady]);

  return (
    <React.Fragment>
      <div className="flex flex-col w-full h-workspace flex-grow content-center items-center">
        <iframe
          className="w-full h-full border-8"
          title="Workspace"
          src={`${GEN3_WORKSPACE_API}/proxy/`}
          onLoad={() => {
            setJupyterReady(true);
          }}
        />
      </div>
    </React.Fragment>
  );
};

export default WorkspaceNotebook;
