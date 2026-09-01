import React, { useEffect, useRef, useState } from 'react';
import { MessageCard } from './MessageCards';
import ErrorCard from './MessageCards/ErrorCard';

const IFrameComponent = ({ url }: { url?: string }) => {
  const [urlStatus, setUrlStatus] = useState<'loading' | 'valid' | 'notfound'>(
    'loading',
  );

  const iframeRef = useRef<HTMLIFrameElement>(null!);

  // Check if the dashboard URL exists
  useEffect(() => {
    if (!url) {
      setUrlStatus('notfound');
      return;
    }

    const checkUrl = async () => {
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            Range: 'bytes=0-0',
          },
        });

        if (response.ok) {
          setUrlStatus('valid');
        } else {
          setUrlStatus('notfound');
        }
      } catch (error) {
        console.error('Failed to check dashboard URL:', error);
        <ErrorCard message="Failed to check dashboard URL" />;
      }
    };

    void checkUrl();
  }, [url]);

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

  // Show loading state while checking URL
  if (urlStatus === 'loading') {
    return (
      <div className="flex w-full h-full items-center justify-center">
        Loading...
      </div>
    );
  }

  if (urlStatus === 'notfound') {
    return <MessageCard message="Notebook not found" />;
  }

  return (
    <iframe
      ref={iframeRef}
      sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
      referrerPolicy="strict-origin-when-cross-origin"
      allow="geolocation 'none'; microphone 'none'; camera 'none'"
      src={url}
      width="100%"
      height="100%"
      title="notebook running in iframe"
    />
  );
};

export default IFrameComponent;
