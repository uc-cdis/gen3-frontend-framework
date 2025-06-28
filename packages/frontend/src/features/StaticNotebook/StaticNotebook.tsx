import React, { useState, useEffect } from 'react';


export interface NotebookViewerProps {
  url: string;
}

const HTMLNotebookViewer = ({url}: NotebookViewerProps) => {
  const [htmlContent, setHtmlContent] = useState('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchHtml() {
      setIsLoading(true);
      try {
        const response = await fetch(url);
        const text = await response.text();
        setHtmlContent(text);
      } catch {
        setIsError(true);
      }
      finally {
        setIsLoading(false);
      }
    }
    fetchHtml();
  }, [url]);

  return (
   <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
);
};
