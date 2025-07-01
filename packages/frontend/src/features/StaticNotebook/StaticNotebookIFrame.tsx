import React from 'react';
import { useRouter } from 'next/dist/client/router';

export interface StaticNotebookViewerProps {
  notebook: string;
}

const StaticNotebookIFrame = ({ notebook }: StaticNotebookViewerProps) => {
  const router = useRouter();

  return (
    <div className="flex w-full h-full">
      <div className="flex justify-items-center w-full">
        <iframe
          allow="cross-origin"
          src={`${router.basePath}/staticNotebooks/${notebook}`}
          width="100%"
          height="100%"
          title="client notebook"
        ></iframe>
      </div>
    </div>
  );
};

export default StaticNotebookIFrame;
