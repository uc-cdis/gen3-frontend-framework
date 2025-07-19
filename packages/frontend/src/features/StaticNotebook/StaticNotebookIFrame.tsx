import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/dist/client/router';
import { GEN3_STATIC_NOTEBOOK_DIR } from './constants';

export interface StaticNotebookViewerProps {
  notebook: string;
}

const StaticNotebookIFrame = ({ notebook }: StaticNotebookViewerProps) => {
  const router = useRouter();

  const iframeRef = useRef<HTMLIFrameElement>(null!);

  useEffect(() => {
    const iframe = iframeRef.current;

    const handleLoad = () => {
      try {
        // Access iframe document
        if (iframe) {
          const iframeDoc =
            iframe.contentDocument || iframe?.contentWindow?.document;

          // Find all anchor tags and add target="_blank"
          const links = iframeDoc?.querySelectorAll('a');
          links?.forEach((link: any) => {
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noreferrer');
          });
        }
      } catch (error) {
        console.error('Cannot access iframe content:', error);
      }
    };

    if (iframe) {
      iframe.addEventListener('load', handleLoad);
      return () => iframe.removeEventListener('load', handleLoad);
    }
  }, []);

  return (
    <div className="flex w-full h-full">
      <div className="flex justify-items-center w-full">
        <iframe
          ref={iframeRef}
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
          referrerPolicy="strict-origin-when-cross-origin"
          allow="geolocation 'none'; microphone 'none'; camera 'none'"
          src={`${router.basePath}/${GEN3_STATIC_NOTEBOOK_DIR}/${notebook}`}
          width="100%"
          height="100%"
          title="client notebook"
        ></iframe>
      </div>
    </div>
  );
};

export default StaticNotebookIFrame;
