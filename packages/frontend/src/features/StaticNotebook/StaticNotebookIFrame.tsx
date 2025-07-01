import React from 'react';
import { useRouter } from 'next/dist/client/router';
import { GEN3_STATIC_NOTEBOOK_DIR } from './constants';

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
