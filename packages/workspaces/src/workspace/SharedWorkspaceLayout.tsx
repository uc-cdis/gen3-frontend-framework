// import React, {
//   ReactNode,
//   useCallback,
//   useEffect,
//   useMemo,
//   useRef,
//   useState,
// } from 'react';
//
// interface SharedWorkspaceLayoutProps {
//   leftPanel: ReactNode;
//   rightPanel?: ReactNode;
//   children: ReactNode;
//   leftLabel?: string;
//   rightLabel?: string;
//   defaultLeftOpen?: boolean;
//   defaultRightOpen?: boolean;
//   onMaximize?: (maximized: boolean) => void;
//   className?: string;
//   /** Extra content rendered in the toolbar row, between fullscreen and Hide Tools. */
//   toolbarExtra?: ReactNode;
// }
//
// const SharedWorkspaceLayout = ({
//   leftPanel,
//   rightPanel,
//   children,
//   leftLabel = 'Data & Tools',
//   rightLabel = 'Infrastructure',
//   defaultLeftOpen = true,
//   defaultRightOpen = true,
//   onMaximize,
//   className,
//   toolbarExtra,
// }: SharedWorkspaceLayoutProps) => {
//   const leftPanelOpenWidth = 'min(280px, 24vw)';
//   const rightPanelOpenWidth = 'min(320px, 28vw)';
//   const hasRightPanel = Boolean(rightPanel);
//   const rootRef = useRef<HTMLElement>(null);
//   const rafRef = useRef<number | null>(null);
//   const nudgeTimeoutRef = useRef<number | null>(null);
//   const lastNudgeAtRef = useRef<number>(0);
//   const panelsBeforeMaximizeRef = useRef({
//     left: defaultLeftOpen,
//     right: hasRightPanel ? defaultRightOpen : false,
//   });
//   const [isMobile, setIsMobile] = useState(false);
//   const [isLeftOpen, setIsLeftOpen] = useState(defaultLeftOpen);
//   const [isRightOpen, setIsRightOpen] = useState(
//     hasRightPanel ? defaultRightOpen : false,
//   );
//   const [isMaximized, setIsMaximized] = useState(false);
//
//   const scheduleLayoutNudge = useCallback(() => {
//     const run = () => {
//       lastNudgeAtRef.current = Date.now();
//       window.dispatchEvent(new Event('resize'));
//       window.dispatchEvent(new CustomEvent('gen3-workspace-layout-changed'));
//       try {
//         const jupyterApp = (window as any).jupyterapp;
//         jupyterApp?.shell?.fit?.();
//         jupyterApp?.shell?.update?.();
//       } catch {
//         // Best effort while Jupyter runtime is still initializing.
//       }
//     };
//
//     if (rafRef.current) {
//       window.cancelAnimationFrame(rafRef.current);
//     }
//     rafRef.current = window.requestAnimationFrame(run);
//
//     if (nudgeTimeoutRef.current) {
//       window.clearTimeout(nudgeTimeoutRef.current);
//     }
//     nudgeTimeoutRef.current = window.setTimeout(run, 220);
//   }, []);
//
//   useEffect(() => {
//     const updateViewportMode = () => {
//       setIsMobile(window.innerWidth < 1024);
//     };
//     updateViewportMode();
//     window.addEventListener('resize', updateViewportMode);
//     return () => {
//       window.removeEventListener('resize', updateViewportMode);
//     };
//   }, []);
//
//   useEffect(() => {
//     onMaximize?.(isMaximized);
//     scheduleLayoutNudge();
//   }, [isLeftOpen, isMaximized, isRightOpen, onMaximize, scheduleLayoutNudge]);
//
//   useEffect(() => {
//     const root = rootRef.current;
//     if (
//       !root ||
//       typeof window === 'undefined' ||
//       typeof ResizeObserver === 'undefined'
//     ) {
//       return;
//     }
//
//     const observer = new ResizeObserver(() => {
//       scheduleLayoutNudge();
//     });
//
//     observer.observe(root);
//
//     const onTransitionEnd = () => {
//       scheduleLayoutNudge();
//     };
//
//     root.addEventListener('transitionend', onTransitionEnd);
//
//     return () => {
//       root.removeEventListener('transitionend', onTransitionEnd);
//       observer.disconnect();
//       if (rafRef.current) {
//         window.cancelAnimationFrame(rafRef.current);
//         rafRef.current = null;
//       }
//       if (nudgeTimeoutRef.current) {
//         window.clearTimeout(nudgeTimeoutRef.current);
//         nudgeTimeoutRef.current = null;
//       }
//     };
//   }, [scheduleLayoutNudge]);
//
//   useEffect(() => {
//     if (hasRightPanel) return;
//     setIsRightOpen(false);
//   }, [hasRightPanel]);
//
//   useEffect(() => {
//     if (isMobile && isMaximized) {
//       setIsLeftOpen(false);
//       setIsRightOpen(false);
//     }
//   }, [isMaximized, isMobile]);
//
//   const toggleMaximize = () => {
//     setIsMaximized((current: boolean) => {
//       const next = !current;
//       if (next) {
//         panelsBeforeMaximizeRef.current = {
//           left: isLeftOpen,
//           right: isRightOpen,
//         };
//         setIsLeftOpen(false);
//         if (hasRightPanel) {
//           setIsRightOpen(false);
//         }
//       } else {
//         setIsLeftOpen(panelsBeforeMaximizeRef.current.left);
//         setIsRightOpen(
//           hasRightPanel ? panelsBeforeMaximizeRef.current.right : false,
//         );
//       }
//       return next;
//     });
//     window.setTimeout(() => {
//       // Delay one frame-equivalent so host layout and panel transitions settle first.
//       scheduleLayoutNudge();
//     }, 40);
//   };
//
//   const rootClass = useMemo(() => {
//     return [
//       'flex h-full w-full min-h-0 flex-1 flex-col overflow-hidden bg-white',
//       className || '',
//     ]
//       .filter(Boolean)
//       .join(' ');
//   }, [className]);
//
//   return (
//     <section
//       ref={rootRef}
//       className={rootClass}
//       data-workspace-maximized={isMaximized ? 'true' : 'false'}
//     >
//       {isMobile && (isLeftOpen || isRightOpen) && (
//         <div
//           className="absolute inset-0 z-40 bg-slate-950/30 backdrop-blur-[1px]"
//           onClick={() => {
//             setIsLeftOpen(false);
//             setIsRightOpen(false);
//           }}
//           aria-hidden="true"
//         />
//       )}
//
//       <div className="flex h-full min-h-0 flex-1 overflow-hidden">
//         <aside
//           aria-label={leftLabel}
//           className={[
//             'relative shrink-0 overflow-hidden border-r border-slate-200 bg-white transition-all duration-300',
//             'dark:border-slate-700 dark:bg-slate-900/95 dark:backdrop-blur-sm',
//             isMobile
//               ? [
//                   'absolute inset-y-0 left-0 z-50 w-[86vw] max-w-[340px] shadow-2xl',
//                   isLeftOpen
//                     ? 'translate-x-0 opacity-100'
//                     : '-translate-x-full opacity-0',
//                 ].join(' ')
//               : isLeftOpen
//                 ? 'z-20 opacity-100'
//                 : 'z-10 w-0 border-r-0 opacity-0',
//           ].join(' ')}
//           style={
//             !isMobile && isLeftOpen ? { width: leftPanelOpenWidth } : undefined
//           }
//         >
//           <div
//             className="flex h-full flex-col"
//             style={!isMobile ? { width: leftPanelOpenWidth } : undefined}
//           >
//             <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
//               <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-300">
//                 {leftLabel}
//               </h2>
//               <button
//                 type="button"
//                 onClick={() => {
//                   setIsLeftOpen(false);
//                   scheduleLayoutNudge();
//                 }}
//                 className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
//                 aria-label="Hide data panel"
//                 title="Hide data panel"
//               >
//                 <svg
//                   className="h-5 w-5"
//                   viewBox="0 0 20 20"
//                   fill="currentColor"
//                   aria-hidden="true"
//                 >
//                   <path
//                     fillRule="evenodd"
//                     d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
//                     clipRule="evenodd"
//                   />
//                 </svg>
//               </button>
//             </div>
//             <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6">
//               {leftPanel}
//             </div>
//           </div>
//         </aside>
//
//         <main
//           className={[
//             'relative z-10 flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white shadow-xl shadow-slate-200/50',
//             'dark:bg-slate-900 dark:shadow-none',
//             isMaximized ? 'h-full max-h-none' : 'h-full',
//           ].join(' ')}
//         >
//           <div className="relative z-30 shrink-0 border-b border-slate-200 bg-white/95 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/80">
//             <div className="flex h-12 items-center justify-between gap-2 px-3 sm:px-4">
//               <div className="flex items-center gap-2">
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setIsLeftOpen((current: boolean) => !current);
//                     scheduleLayoutNudge();
//                   }}
//                   className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
//                   aria-label={
//                     isLeftOpen ? 'Hide data panel' : 'Show data panel'
//                   }
//                   title={isLeftOpen ? 'Hide data panel' : 'Show data panel'}
//                 >
//                   <svg
//                     className="h-4 w-4"
//                     viewBox="0 0 20 20"
//                     fill="currentColor"
//                     aria-hidden="true"
//                   >
//                     <path
//                       fillRule="evenodd"
//                       d={
//                         isLeftOpen
//                           ? 'M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z'
//                           : 'M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z'
//                       }
//                       clipRule="evenodd"
//                     />
//                   </svg>
//                   <span className="hidden text-[11px] font-semibold uppercase tracking-[0.08em] sm:inline">
//                     {isLeftOpen ? 'Hide Data' : 'Show Data'}
//                   </span>
//                 </button>
//               </div>
//
//               <div className="flex items-center gap-2">
//                 {toolbarExtra}
//                 <button
//                   type="button"
//                   onClick={toggleMaximize}
//                   aria-label={
//                     isMaximized ? 'Exit fullscreen' : 'Enter fullscreen'
//                   }
//                   className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 dark:hover:text-primary-light"
//                   title={isMaximized ? 'Exit fullscreen' : 'Enter fullscreen'}
//                 >
//                   {isMaximized ? (
//                     <>
//                       <svg
//                         className="h-4 w-4"
//                         fill="none"
//                         viewBox="0 0 24 24"
//                         stroke="currentColor"
//                         aria-hidden="true"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth={2}
//                           d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
//                         />
//                       </svg>
//                       <span className="hidden sm:inline">Exit Fullscreen</span>
//                     </>
//                   ) : (
//                     <>
//                       <svg
//                         className="h-4 w-4"
//                         fill="none"
//                         viewBox="0 0 24 24"
//                         stroke="currentColor"
//                         aria-hidden="true"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth={2}
//                           d="M10 6H6m0 0V2m0 4l4-4m4 14h4m0 0v4m0-4l-4 4M6 14H2m0 0v4m0-4l4 4"
//                         />
//                       </svg>
//                       <span className="hidden sm:inline">Enter Fullscreen</span>
//                     </>
//                   )}
//                 </button>
//
//                 {hasRightPanel ? (
//                   <button
//                     type="button"
//                     onClick={() => {
//                       setIsRightOpen((current: boolean) => !current);
//                       scheduleLayoutNudge();
//                     }}
//                     className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
//                     aria-label={
//                       isRightOpen ? 'Hide tools panel' : 'Show tools panel'
//                     }
//                     title={
//                       isRightOpen ? 'Hide tools panel' : 'Show tools panel'
//                     }
//                   >
//                     <svg
//                       className="h-4 w-4"
//                       viewBox="0 0 20 20"
//                       fill="currentColor"
//                       aria-hidden="true"
//                     >
//                       <path
//                         fillRule="evenodd"
//                         d={
//                           isRightOpen
//                             ? 'M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z'
//                             : 'M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z'
//                         }
//                         clipRule="evenodd"
//                       />
//                     </svg>
//                     <span className="hidden text-[11px] font-semibold uppercase tracking-[0.08em] sm:inline">
//                       {isRightOpen ? 'Hide Tools' : 'Show Tools'}
//                     </span>
//                   </button>
//                 ) : (
//                   <div className="h-9 w-9" aria-hidden="true" />
//                 )}
//               </div>
//             </div>
//           </div>
//
//           <div className="relative z-0 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white dark:bg-slate-900">
//             {/* Ensure children (Jupyter) get full height context */}
//             <div className="relative z-0 flex h-full w-full flex-1 flex-col overflow-hidden">
//               {children}
//             </div>
//           </div>
//         </main>
//
//         {hasRightPanel && (
//           <aside
//             aria-label={rightLabel}
//             className={[
//               'relative shrink-0 overflow-hidden border-l border-slate-200 bg-white transition-all duration-300',
//               'dark:border-slate-700 dark:bg-slate-900/95 dark:backdrop-blur-sm',
//               isMobile
//                 ? [
//                     'absolute inset-y-0 right-0 z-50 w-[88vw] max-w-[360px] shadow-2xl',
//                     isRightOpen
//                       ? 'translate-x-0 opacity-100'
//                       : 'translate-x-full opacity-0',
//                   ].join(' ')
//                 : isRightOpen
//                   ? 'z-20 opacity-100'
//                   : 'z-10 w-0 border-l-0 opacity-0',
//             ].join(' ')}
//             style={
//               !isMobile && isRightOpen
//                 ? { width: rightPanelOpenWidth }
//                 : undefined
//             }
//           >
//             <div
//               className="flex h-full flex-col"
//               style={!isMobile ? { width: rightPanelOpenWidth } : undefined}
//             >
//               <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
//                 <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-300">
//                   {rightLabel}
//                 </h2>
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setIsRightOpen(false);
//                     scheduleLayoutNudge();
//                   }}
//                   className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
//                   aria-label="Hide tools panel"
//                   title="Hide tools panel"
//                 >
//                   <svg
//                     className="h-5 w-5"
//                     viewBox="0 0 20 20"
//                     fill="currentColor"
//                     aria-hidden="true"
//                   >
//                     <path
//                       fillRule="evenodd"
//                       d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
//                       clipRule="evenodd"
//                     />
//                   </svg>
//                 </button>
//               </div>
//               <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6">
//                 {rightPanel}
//               </div>
//             </div>
//           </aside>
//         )}
//       </div>
//     </section>
//   );
// };
//
// export type { SharedWorkspaceLayoutProps };
// export default SharedWorkspaceLayout;
