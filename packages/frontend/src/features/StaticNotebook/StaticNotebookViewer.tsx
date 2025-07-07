import React, { useState, useEffect } from 'react';
import { Center, LoadingOverlay } from '@mantine/core';
import { GEN3_STATIC_NOTEBOOK_API } from './constants';
import { ErrorCard } from '../../components/MessageCards';

export interface StaticNotebookViewerProps {
  notebook: string;
}

const StaticNotebookViewer = ({ notebook }: StaticNotebookViewerProps) => {
  const [htmlContent, setHtmlContent] = useState('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchHtml() {
      const headers = new Headers();
      headers.set('Content-Type', 'application/json');
      setIsLoading(true);
      try {
        const response = await fetch(
          `${GEN3_STATIC_NOTEBOOK_API}?notebook=${notebook}`,
          { headers: headers },
        );
        const json = await response.json();
        setHtmlContent(json.content);
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error(error.message);
        }
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    }

    fetchHtml();
  }, [notebook]);

  if (isError) {
    return (
      <div className="flex w-full h-full">
        <Center>
          <ErrorCard message={`Error loading notebook ${notebook}`} />
        </Center>
      </div>
    );
  }

  return (
    <div className="flex w-full h-full">
      <LoadingOverlay visible={isLoading} />
      <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
    </div>
  );
};

export default StaticNotebookViewer;
