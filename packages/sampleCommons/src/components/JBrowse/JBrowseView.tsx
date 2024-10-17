'use client';
import React, { useState, useEffect } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import '@fontsource/roboto';
import {
  createViewState,
  JBrowseLinearGenomeView,
} from '@jbrowse/react-linear-genome-view';

import assembly from './assembly';
import tracks from './tracks';
import defaultSession from './defaultSession';

type ViewModel = ReturnType<typeof createViewState>;

export default function JBrowseView() {
  const [viewState, setViewState] = useState<ViewModel>();
  const [patches, setPatches] = useState('');
  const [stateSnapshot, setStateSnapshot] = useState('');

  useEffect(() => {
    const state = createViewState({
      assembly,
      tracks,
      onChange: (patch: any) => {
        setPatches((previous) => previous + JSON.stringify(patch) + '\n');
      },
      defaultSession,
      configuration: {
        rpc: {
          defaultDriver: 'WebWorkerRpcDriver',
        },
        plugins: [
          {
            name: 'MafViewer',
            url: 'https://unpkg.com/jbrowse-plugin-mafviewer/dist/jbrowse-plugin-mafviewer.umd.production.min.js',
          },
        ],
      },
      makeWorkerInstance: () => {
        return new Worker(new URL('./rpcWorker', import.meta.url));
      },

      hydrateFn: hydrateRoot,
      createRootFn: createRoot,
    });
    setViewState(state);
  }, []);

  if (!viewState) {
    return null;
  }

  return (
    <>
      <JBrowseLinearGenomeView viewState={viewState} />
    </>
  );
}
