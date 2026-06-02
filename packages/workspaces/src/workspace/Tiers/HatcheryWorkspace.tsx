import React, { useRef, useState } from 'react';
import {
  MicroContainerProvider,
  useMicoContainerContext,
} from '../../providers/MicroContainerProvider';
import MicroContainerPanel from '../../components/MicroContainerPanel';

export interface HatcheryWorkspaceProps {
  assetBaseUrl?: string;
  className?: string;
  onReady?: () => void;
  onError?: (error: Error) => void;
}

const HatcheryWorkspacePanel = ({
  assetBaseUrl = '/jupyter',
  className,
  onReady,
  onError,
}: HatcheryWorkspaceProps) => {
  const { status } = useMicoContainerContext();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const url = `${assetBaseUrl}/lab/index.html`;
  if (status !== 'running') return <MicroContainerPanel />;

  return (
    <iframe
      key={retryCount}
      ref={iframeRef}
      src={url}
      title="Remote Jupyter Workspace"
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads allow-modals allow-storage-access-by-user-activation"
      allow="clipboard-read; clipboard-write; cross-origin-isolated"
      className="min-h-0 flex-1 border-0"
      style={{ width: '100%' }}
      onLoad={() => {
        setLoading(false);
      }}
      onError={() => {
        setLoadError(true);
        onError?.(new Error('Unable to load remote Jupyter workspace.'));
      }}
    ></iframe>
  );
};

const HatcheryWorkspace = () => {
  return (
    <MicroContainerProvider enabled={true}>
      <HatcheryWorkspacePanel />
    </MicroContainerProvider>
  );
};

export default HatcheryWorkspace;
