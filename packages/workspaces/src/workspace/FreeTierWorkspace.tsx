// import React, { useCallback, useEffect, useRef, useState } from 'react';
//
// /**
//  * Config type kept for API compatibility with HostedWorkspaceExperience.
//  * With the iframe approach these options are baked into the served JupyterLite
//  * build; runtime override via config injection is not used.
//  */
// export interface FreeTierWorkspaceConfig {
//   appName?: string;
//   baseUrl?: string;
//   staticUrl?: string;
//   contentsStorageDrivers?: string[] | null;
//   workspacesStorageDrivers?: string[] | null;
//   settingsStorageDrivers?: string[] | null;
//   litePluginSettings?: Record<string, unknown>;
//   federatedExtensions?: Array<Record<string, unknown>>;
//   disabledExtensions?: string[];
//   exposeAppInBrowser?: boolean;
//   notebookStartsKernel?: boolean;
// }
//
// interface FreeTierWorkspaceProps {
//   assetBaseUrl?: string;
//   className?: string;
//   config?: FreeTierWorkspaceConfig;
//   onReady?: () => void;
//   onError?: (error: Error) => void;
// }
//
// const FreeTierWorkspace = ({
//   assetBaseUrl = '/jupyter',
//   className,
//   onReady,
//   onError,
// }: FreeTierWorkspaceProps) => {
//   const [loading, setLoading] = useState(true);
//   const [loadError, setLoadError] = useState(false);
//   const [retryCount, setRetryCount] = useState(0);
//   const iframeRef = useRef<HTMLIFrameElement | null>(null);
//
//   const normalizedBase = assetBaseUrl.replace(/\/$/, '');
//
//   // Tell JupyterLite inside the iframe to recompute its layout.
//   // No inline pixel overrides — CSS percentage sizing handles dimensions;
//   // we only need to poke JupyterLab's shell so it reflows its internals.
//   const nudgeIframeLayout = useCallback(() => {
//     const frameWindow = iframeRef.current?.contentWindow;
//     if (!frameWindow) return;
//     try {
//       frameWindow.dispatchEvent(new Event('resize'));
//       const app = (frameWindow as any).jupyterapp;
//       app?.shell?.fit?.();
//       app?.shell?.update?.();
//     } catch {
//       // cross-origin guard — ignore
//     }
//   }, []);
//
//   useEffect(() => {
//     const onLayoutChanged = () => {
//       // The panel transition takes 300ms (duration-300). Fire resize events
//       // at a few points during and after the transition.
//       nudgeIframeLayout();
//       const ids = [100, 200, 350].map((ms) =>
//         window.setTimeout(nudgeIframeLayout, ms),
//       );
//       return () => ids.forEach((id) => window.clearTimeout(id));
//     };
//
//     window.addEventListener(
//       'gen3-workspace-free-tier-layout-changed',
//       onLayoutChanged as EventListener,
//     );
//
//     return () => {
//       window.removeEventListener(
//         'gen3-workspace-free-tier-layout-changed',
//         onLayoutChanged as EventListener,
//       );
//     };
//   }, [nudgeIframeLayout]);
//
//   const handleRetry = () => {
//     setLoadError(false);
//     setLoading(true);
//     setRetryCount((n) => n + 1);
//   };
//
//   return (
//     <section
//       className={`flex min-h-0 flex-1 flex-col overflow-hidden bg-base-max ${className || ''}`}
//     >
//       {loading && !loadError && (
//         <div
//           role="status"
//           aria-label="Workspace loading"
//           className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-white/70 backdrop-blur-sm dark:bg-slate-900/70"
//         >
//           <div className="pointer-events-auto flex flex-col items-center gap-3 rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900">
//             <div
//               className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-primary"
//               aria-hidden="true"
//             />
//             <p className="text-sm font-semibold text-slate-700">
//               Initializing Workspace...
//             </p>
//             <button
//               type="button"
//               onClick={() => window.location.reload()}
//               className="mt-1 text-xs text-base-light underline hover:text-primary"
//             >
//               Taking too long? Reload
//             </button>
//           </div>
//         </div>
//       )}
//
//       {loadError && (
//         <div
//           role="alert"
//           className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center bg-white/80 backdrop-blur-sm dark:bg-slate-900/80"
//         >
//           <div className="pointer-events-auto w-full max-w-md rounded-lg border border-primary-light bg-white p-4 text-sm shadow-sm dark:border-primary-dark dark:bg-slate-900">
//             <p className="font-semibold text-primary dark:text-primary-light">
//               Jupyter failed to render
//             </p>
//             <p className="mt-1 text-slate-700 dark:text-slate-200">
//               Unable to load JupyterLite. Check the browser console for details.
//             </p>
//             <button
//               type="button"
//               onClick={handleRetry}
//               className="mt-3 rounded border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-800 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
//             >
//               Retry
//             </button>
//           </div>
//         </div>
//       )}
//
//       {/*
//        * The iframe fills its parent via flex-1 + min-h-0 on the section and
//        * flex:1 on the iframe itself. NO absolute positioning or inline pixel
//        * styles — that way the browser's flex engine keeps the iframe sized
//        * correctly as the SharedWorkspaceLayout panels open/close.
//        *
//        * sandbox: allow-same-origin is required for JupyterLite to access
//        * IndexedDB, localStorage, and register its service worker.
//        * allow-storage-access-by-user-activation lets the iframe request
//        * storage access if the browser blocks third-party storage by default.
//        *
//        * allow="cross-origin-isolated" delegates the cross-origin isolation
//        * feature policy into the iframe so Pyodide can use SharedArrayBuffer
//        * for multi-threaded WASM (requires COOP/COEP headers on both this
//        * page and the iframe src — provided by the asset proxy + next.config).
//        */}
//       <iframe
//         key={retryCount}
//         ref={iframeRef}
//         src={`${normalizedBase}/lab/index.html`}
//         title="JupyterLite Workspace"
//         sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads allow-modals allow-storage-access-by-user-activation"
//         allow="clipboard-read; clipboard-write; cross-origin-isolated"
//         className="min-h-0 flex-1 border-0"
//         style={{ width: '100%' }}
//         onLoad={() => {
//           setLoading(false);
//           nudgeIframeLayout();
//           onReady?.();
//         }}
//         onError={() => {
//           setLoadError(true);
//           onError?.(new Error('Unable to load JupyterLite workspace.'));
//         }}
//       />
//     </section>
//   );
// };
//
// export type { FreeTierWorkspaceProps };
// export default FreeTierWorkspace;
