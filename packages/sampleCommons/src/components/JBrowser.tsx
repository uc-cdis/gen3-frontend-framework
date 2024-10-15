'use client';
import React, { useState, useEffect } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { createViewState, JBrowseApp } from '@jbrowse/react-app';

import makeWorkerInstance from '@jbrowse/react-app/esm/makeWorkerInstance';

import config from './config';

type ViewModel = ReturnType<typeof createViewState>;

function JBrowseView() {
  const [viewState, setViewState] = useState<ViewModel>();
  const [stateSnapshot, setStateSnapshot] = useState('');

  useEffect(() => {
    const state = createViewState({
      config: {
        ...config,
        configuration: {
          rpc: {
            defaultDriver: 'WebWorkerRpcDriver',
          },
        },
      },

      //   makeWorkerInstance,

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
      <h1>JBrowse 2 React App Demo (with next14)</h1>
      <JBrowseApp viewState={viewState} />
      <h3>Code</h3>
      <p>
        The code for this app is available at{' '}
        <a
          href="https://github.com/GMOD/jbrowse-react-app-nextjs-demo"
          target="_blank"
          rel="noreferrer"
        >
          https://github.com/GMOD/jbrowse-react-app-nextjs-demo
        </a>
        .
      </p>

      <h3>See the state</h3>
      <div>
        <p>
          The button below will show you the current session, which includes
          things like what region the view is showing and which tracks are open.
          This session JSON object can be used in the{' '}
          <code>defaultSession</code> of <code>createViewState</code>.
        </p>
        <button
          onClick={() => {
            setStateSnapshot(JSON.stringify(viewState.session, undefined, 2));
          }}
        >
          Show session
        </button>
      </div>
      <textarea value={stateSnapshot} readOnly rows={20} cols={80} />
    </>
  );
}

export default JBrowseView;
