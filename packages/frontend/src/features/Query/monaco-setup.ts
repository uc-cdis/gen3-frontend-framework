// lib/monaco-setup.ts
'use client';

if (typeof window !== 'undefined') {
  // 1. Initialize the global environment object if it doesn't exist
  window.MonacoEnvironment = window.MonacoEnvironment || {};

  // 2. Define the mandatory getWorker function using standard browser ESM Workers
  window.MonacoEnvironment.getWorker = function (
    _workerId: string,
    label: string,
  ) {
    if (label === 'graphql') {
      return new Worker(
        new URL('monaco-graphql/graphql.worker', import.meta.url),
        { type: 'module' },
      );
    }
    // Fallback default editor features (formatting, diffing, etc.)
    return new Worker(
      new URL('monaco-editor/esm/vs/editor/editor.worker', import.meta.url),
      { type: 'module' },
    );
  };
}
