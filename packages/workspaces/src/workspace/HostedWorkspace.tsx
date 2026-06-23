// import React, { JSX, useEffect, useMemo, useState } from 'react';
// import TierSelectorLanding from '../components/TierSelectorLanding';
// import type { MicroContainerConfig } from '../types';
// import { type WorkspaceTier } from '../types';
// // TODO:  import when these components are ready
// // import InfrastructureRightPanel from '../components/InfrastructureRightPanel';
// // import MicroContainerPanel from '../components/MicroContainerPanel';
// // import type { KernelLifecyclePanelProps } from '../components/KernelLifecyclePanel';
// // import type { UpgradeActionsPanelProps } from '../components/UpgradeActionsPanel';
// import SharedWorkspaceLayout from './SharedWorkspaceLayout';
// import FreeTierWorkspace, { type FreeTierWorkspaceConfig, } from './FreeTierWorkspace';
// import RemoteComputeWorkspace from './RemoteComputeWorkspace';
// import { useGatewayConnection } from '../hooks/useGatewayConnection';
// import { useMicroContainer } from '../hooks/useMicroContainer';
// import { MicroContainerStatus } from '../providers/MicroContainerProvider';
// import {
//   type AuthVerificationResult,
//   verifyWorkspaceAccess,
//   type WorkspaceAccessPolicy,
//   type WorkspaceAuthContext,
// } from '../auth/auth';
//
// /** Stubs/temporary declarations for components commented out above
//  *
//  */
//
// export type KernelLifecyclePanelProps = {
//   kernels: any[];
//   kernelSpecs: any[];
//   loading?: boolean;
//   error?: string | null;
//   notice?: string | null;
//   launching?: boolean;
//   /** Current gateway connection state — drives status badge and reconnect strip. */
//   connectionState?: any;
//   /** The currently active kernel (for billing banner). */
//   activeKernelName?: string | null;
//   /** How long the micro-container has been online, in minutes. Shown per-kernel as "Container Uptime". */
//   containerUptimeMinutes?: number | null;
//   /** Called when user clicks Retry in the error badge. */
//   onRetryConnection?: () => void;
//   onRunStaleReap?: () => void;
//   onLaunchKernel?: (input: any) => void;
//   onOpenNotebook?: (kernelId: string) => void;
//   onTerminateKernel?: (kernelId: string) => void;
//   onKernelSelectionChange?: (selection: any) => void;
//   idleKillDays?: number;
//   maxKernelAgeDays?: number;
//   /**
//    * When true, the Terminate button on each kernel row is labeled "Force Terminate"
//    * and is always visible regardless of the kernel execution state.
//    * Use this in JEG mode where GPU kernels can get stuck and must be force-evicted.
//    */
//   forceTerminate?: boolean;
// };
//
// interface UpgradeActionsPanelProps {
//   currentTier: WorkspaceTier;
//   onUpgradeToRemote?: () => void;
//   onRequestQuotaIncrease?: () => void;
//   onOpenBillingSupport?: () => void;
// }
//
// type MicroContainerPanelProps = {
//   status: MicroContainerStatus;
//   lastError?: string | null;
//   /** Called when user clicks "Launch Workspace". */
//   onLaunch: () => void;
//   /** Called when user clicks "Stop Workspace". */
//   onTerminate: () => void;
//   /** Whether the panel should render in compact mode (status === 'running'). */
//   compact?: boolean;
// };
//
// type InfrastructureRightPanelProps = {
//   kernelPanel: KernelLifecyclePanelProps;
//   upgradePanel: UpgradeActionsPanelProps;
//   showKernelPanel?: boolean;
//   /**
//    * When false, hides the UpgradeActionsPanel. Set to false once a user is already
//    * in the remote-tier micro-container experience — upgrade messaging is irrelevant.
//    * Default: true.
//    */
//   showUpgradePanel?: boolean;
// };
//
// export const InfrastructureRightPanel = (
//   _params: InfrastructureRightPanelProps,
// ): JSX.Element => {
//   return <div>InfrastructureRightPanel Placeholder</div>;
// };
// export const MicroContainerPanel = (_params: MicroContainerPanelProps): JSX.Element => {
//   return <div>MicroContainerPanel Placeholder</div>;
// };
//
// /**
//  * end stubs
//  */
//
//
//
// export type HostedWorkspaceProps = {
//   leftPanel: React.ReactNode;
//   freeTierConfig?: FreeTierWorkspaceConfig;
//   initialTier?: WorkspaceTier;
//   onToggleHostChrome?: (hidden: boolean) => void;
//   onBackToTierSelection?: () => void;
//   upgradePanelOverrides?: Partial<
//     Omit<UpgradeActionsPanelProps, 'currentTier'>
//   >;
//   freeAssetBaseUrl?: string;
//   remoteAssetBaseUrl?: string;
//   gatewayBaseUrl?: string;
//   /**
//    * Base URL used to probe the Jupyter Server inside the workspace pod.
//    * Probes GET `{workspaceProxyBaseUrl}/api/status` via workspace-proxy.
//    * Default: '/lw-workspace/proxy'
//    */
//   workspaceProxyBaseUrl?: string;
//   /** When provided, enables the Hatchery micro-container lifecycle (remote tier only). */
//   microContainerConfig?: MicroContainerConfig;
//   /** Base URL for the Hatchery proxy API route (default: '/api/workspace/hatchery'). */
//   hatcheryBaseUrl?: string;
//   authContext?: WorkspaceAuthContext;
//   accessPolicy?: WorkspaceAccessPolicy;
//   localDevBypassEnabled?: boolean;
//   verifyAccess?: (
//     authContext: WorkspaceAuthContext | null | undefined,
//     accessPolicy?: WorkspaceAccessPolicy,
//   ) => AuthVerificationResult;
//   onAuthRejected?: (result: AuthVerificationResult) => void;
//   onAuthVerified?: (result: AuthVerificationResult) => void;
//   showTierSwitcher?: boolean;
//   rightPanelDefaultOpen?: boolean;
//   className?: string;
//   /**
//    * When true, the JEG GPU kernel lifecycle panel is shown alongside the
//    * micro-container workspace. Requires ENABLE_JEG=true + JUPYTER_GATEWAY_URL
//    * to be set in the deployment. Defaults to false — no panel, no polling, no errors.
//    */
//   jegEnabled?: boolean;
//   /**
//    * Base URL for the /jeg-panel/ route on workspace-proxy.
//    * The panel fetches kernelspecs, kernels, and launches from this URL.
//    * e.g. '/lw-workspace/proxy/jeg-panel'
//    * When jegEnabled=true and this is provided it overrides gatewayBaseUrl for
//    * all kernel lifecycle panel data fetching.
//    */
//   jegGatewayBaseUrl?: string;
// };
//
// const HostedWorkspace = ({
//   leftPanel,
//   freeTierConfig,
//   initialTier,
//   onToggleHostChrome,
//   onBackToTierSelection,
//   upgradePanelOverrides,
//   freeAssetBaseUrl = '/jupyter',
//   remoteAssetBaseUrl = '/api/workspace-assets/remote',
//   gatewayBaseUrl = '/api/workspace/kernel',
//   workspaceProxyBaseUrl = '/lw-workspace/proxy',
//   microContainerConfig,
//   hatcheryBaseUrl = '/api/workspace/hatchery',
//   authContext,
//   accessPolicy,
//   localDevBypassEnabled = false,
//   verifyAccess,
//   onAuthRejected,
//   onAuthVerified,
//   showTierSwitcher = true,
//   rightPanelDefaultOpen = true,
//   className,
//   jegEnabled = false,
//   jegGatewayBaseUrl,
// }: HostedWorkspaceProps) => {
//   const [tier, setTier] = useState<WorkspaceTier | null>(initialTier || null);
//   const [runtimeEpoch, setRuntimeEpoch] = useState(0);
//
//   /* ---- Gateway connection (only active when remote tier) -------- */
//
//   const gateway = useGatewayConnection({
//     gatewayBaseUrl:
//       jegEnabled && jegGatewayBaseUrl ? jegGatewayBaseUrl : gatewayBaseUrl,
//     authContext,
//     // Poll whenever in remote tier. If JEG is unavailable the status endpoint
//     // returns {enabled:false} and polling self-disables via POLL_MS['unavailable']=0.
//     kernelPollIntervalMs: tier === 'remote' ? 5000 : 0,
//   });
//
//   /* ---- Micro-container lifecycle (remote tier, when configured) - */
//
//   const microContainer = useMicroContainer({
//     identifierTag: microContainerConfig?.identifierTag,
//     hatcheryBaseUrl,
//     jwt: authContext?.jwt,
//     enabled: Boolean(microContainerConfig) && tier === 'remote',
//   });
//
//   // Track when the micro-container became "running" so we can show uptime.
//   const containerRunSinceRef = React.useRef<number | null>(null);
//   const [containerUptimeMinutes, setContainerUptimeMinutes] = useState<
//     number | null
//   >(null);
//
//   useEffect(() => {
//     if (microContainer.status === 'running') {
//       if (containerRunSinceRef.current == null) {
//         containerRunSinceRef.current = Date.now();
//       }
//     } else {
//       containerRunSinceRef.current = null;
//       setContainerUptimeMinutes(null);
//     }
//   }, [microContainer.status]);
//
//   // Tick uptime every 60 s while the container is running.
//   useEffect(() => {
//     if (microContainer.status !== 'running') return;
//     const tick = () => {
//       if (containerRunSinceRef.current != null) {
//         setContainerUptimeMinutes(
//           Math.floor((Date.now() - containerRunSinceRef.current) / 60_000),
//         );
//       }
//     };
//     tick();
//     const id = setInterval(tick, 60_000);
//     return () => clearInterval(id);
//   }, [microContainer.status]);
//
//   /* ---- Build kernel panel from Gateway data --------------------- */
//
//   const jegNotice = useMemo((): string | null => {
//     if (!jegEnabled) return null;
//     if (gateway.connectionState === 'unavailable') return null;
//     if (gateway.specs.loading || gateway.kernelList.loading) return null;
//     if (gateway.activeKernel) {
//       return 'GPU kernel running — open the kernel picker (in JupyterLab above) to connect notebooks to it.';
//     }
//     return 'Select a GPU kernel type and click Launch. Once it starts, JupyterLab will detect it — open the kernel picker to connect.';
//   }, [
//     jegEnabled,
//     gateway.connectionState,
//     gateway.specs.loading,
//     gateway.kernelList.loading,
//     gateway.activeKernel,
//   ]);
//
//   const kernelPanel: KernelLifecyclePanelProps = useMemo(() => {
//     const kernelRows = gateway.kernelList.kernels.map((k) => ({
//       kernelId: k.id,
//       kernelName: k.name,
//       executionState: k.execution_state,
//     }));
//     const specEntries = gateway.specs.specs.map((s) => ({
//       name: s.name,
//       displayName: s.spec.display_name,
//       language: s.spec.language,
//       cpu: s.resources?.['cpu'] ?? undefined,
//       memory: s.resources?.['memory'] ?? undefined,
//       gpuType:
//         s.resources?.['gpu_type'] ?? s.resources?.['gpuType'] ?? undefined,
//     }));
//     return {
//       kernels: kernelRows,
//       kernelSpecs: specEntries,
//       loading: gateway.specs.loading || gateway.kernelList.loading,
//       error:
//         gateway.specs.error || gateway.kernelList.error || gateway.lastError,
//       launching:
//         gateway.connectionState === 'launching' ||
//         gateway.connectionState === 'attaching',
//       connectionState: gateway.connectionState,
//       activeKernelName: gateway.activeKernel?.name ?? null,
//       containerUptimeMinutes,
//       notice: jegNotice,
//       forceTerminate: jegEnabled,
//       onRetryConnection: () => gateway.startReconnect(),
//       onLaunchKernel: (input: any) => {
//         void gateway.launchAndAttach(input.kernelName);
//       },
//       onTerminateKernel: (kernelId: any) => {
//         void gateway.terminate(kernelId);
//       },
//     } as KernelLifecyclePanelProps;
//   }, [gateway, jegEnabled, jegNotice, containerUptimeMinutes]);
//
//   useEffect(() => {
//     setRuntimeEpoch((prev) => prev + 1);
//   }, [tier]);
//
//   // Bump the iframe epoch each time a new container becomes running, so
//   // RemoteComputeWorkspace unmounts and remounts with a fresh iframe instead
//   // of keeping the stale one from a previous container session.
//   const prevContainerStatusRef = React.useRef<string | null>(null);
//   useEffect(() => {
//     const prev = prevContainerStatusRef.current;
//     prevContainerStatusRef.current = microContainer.status;
//     if (
//       microContainer.status === 'running' &&
//       prev !== null &&
//       prev !== 'running'
//     ) {
//       setRuntimeEpoch((prev) => prev + 1);
//     }
//   }, [microContainer.status]);
//
//   const upgradePanel: UpgradeActionsPanelProps = useMemo(
//     () => ({
//       currentTier: tier || 'free',
//       onUpgradeToRemote: () => setTier('remote'),
//       ...upgradePanelOverrides,
//     }),
//     [tier, upgradePanelOverrides],
//   );
//
//   const effectiveAccessPolicy = useMemo(
//     () => ({
//       ...(accessPolicy || {}),
//       allowLocalDevBypass:
//         localDevBypassEnabled || Boolean(accessPolicy?.allowLocalDevBypass),
//     }),
//     [accessPolicy, localDevBypassEnabled],
//   );
//
//   const authResult = useMemo(() => {
//     const verifier = verifyAccess || verifyWorkspaceAccess;
//     return verifier(authContext, effectiveAccessPolicy);
//   }, [verifyAccess, authContext, effectiveAccessPolicy]);
//
//   useEffect(() => {
//     if (authResult.allowed) {
//       onAuthVerified?.(authResult);
//     } else {
//       onAuthRejected?.(authResult);
//     }
//   }, [authResult, onAuthRejected, onAuthVerified]);
//
//   if (!authResult.allowed) {
//     return (
//       <section
//         aria-label="Workspace access blocked"
//         className="flex h-full min-h-0 w-full items-center justify-center bg-white p-6"
//       >
//         <div className="w-full max-w-xl rounded-xl border border-slate-300 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/90">
//           <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
//             Workspace Access Blocked
//           </h2>
//           <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
//             Host-provided auth context failed verification for this workspace
//             package.
//           </p>
//           <p
//             role="alert"
//             className="mt-2 rounded border border-accentWarm-light bg-accentWarm-max px-3 py-2 text-xs text-accentWarm-dark dark:border-accentWarm-dark dark:bg-accentWarm-dark/20 dark:text-accentWarm-lightest"
//           >
//             Reason: {authResult.reason || 'Access policy check failed.'}
//           </p>
//         </div>
//       </section>
//     );
//   }
//
//   if (!tier) {
//     return (
//       <div
//         className={[
//           'h-full min-h-0 w-full overflow-hidden bg-white',
//           className || '',
//         ]
//           .filter(Boolean)
//           .join(' ')}
//       >
//         <TierSelectorLanding onSelectTier={setTier} cards={{}} />
//       </div>
//     );
//   }
//
//   return (
//     <section
//       className={[
//         'flex h-full min-h-0 w-full flex-col overflow-hidden bg-white',
//         className || '',
//       ]
//         .filter(Boolean)
//         .join(' ')}
//     >
//       {showTierSwitcher && (
//         <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 py-3 dark:border-slate-700 dark:bg-slate-900/90">
//           <div className="flex items-center gap-3">
//             <div
//               className={`flex h-8 w-8 items-center justify-center rounded-lg ${tier === 'free' ? 'bg-primary-light/20 text-primary' : 'bg-accent-light/20 text-accent-dark'}`}
//             >
//               <svg
//                 className="h-5 w-5"
//                 viewBox="0 0 24 24"
//                 fill="none"
//                 stroke="currentColor"
//                 strokeWidth="2"
//                 aria-hidden="true"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"
//                 />
//               </svg>
//             </div>
//             <div>
//               <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
//                 {tier === 'free'
//                   ? 'Local Browser Environment'
//                   : 'Remote Compute Environment'}
//               </h2>
//               <p className="text-xs text-slate-500 dark:text-slate-400">
//                 {tier === 'free'
//                   ? 'Running via JupyterLite (Free Tier)'
//                   : 'Running via Remote Kernels (Paid Tier)'}
//               </p>
//             </div>
//           </div>
//           <div className="flex items-center gap-3">
//             <span className="hidden text-xs font-medium text-slate-400 sm:inline-block">
//               Need more power?
//             </span>
//             <button
//               type="button"
//               onClick={() => {
//                 onBackToTierSelection?.();
//                 setTier(null);
//               }}
//               className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:border-primary-light hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-600"
//             >
//               Switch Tier
//             </button>
//           </div>
//         </div>
//       )}
//
//       <SharedWorkspaceLayout
//         leftPanel={leftPanel}
//         rightPanel={
//           <InfrastructureRightPanel
//             kernelPanel={kernelPanel}
//             upgradePanel={upgradePanel}
//             showKernelPanel={tier === 'remote'}
//             showUpgradePanel={tier !== 'remote'}
//           />
//         }
//         leftLabel="Data & Tools"
//         rightLabel={
//           tier === 'remote' ? 'Compute & Kernel' : 'Workspace Actions'
//         }
//         defaultLeftOpen={true}
//         defaultRightOpen={rightPanelDefaultOpen}
//         onMaximize={(maximized) => onToggleHostChrome?.(maximized)}
//         toolbarExtra={
//           microContainerConfig &&
//           tier === 'remote' &&
//           microContainer.status === 'running' ? (
//             <MicroContainerPanel
//               status={microContainer.status}
//               lastError={microContainer.lastError}
//               onLaunch={() => void microContainer.launch()}
//               onTerminate={() => void microContainer.terminate()}
//               compact
//             />
//           ) : undefined
//         }
//       >
//         {tier === 'free' ? (
//           <FreeTierWorkspace
//             key={`free-runtime-${runtimeEpoch}`}
//             assetBaseUrl={freeAssetBaseUrl}
//             config={freeTierConfig}
//           />
//         ) : microContainerConfig ? (
//           // Remote tier with micro-container lifecycle gate
//           <>
//             {microContainer.status !== 'running' ? (
//               // Container not running — show only the launch panel, no iframe
//               <div className="flex h-full min-h-0 items-center justify-center bg-white p-8 dark:bg-slate-950">
//                 <div className="w-full max-w-sm">
//                   <MicroContainerPanel
//                     status={microContainer.status}
//                     lastError={microContainer.lastError}
//                     onLaunch={() => void microContainer.launch()}
//                     onTerminate={() => void microContainer.terminate()}
//                   />
//                 </div>
//               </div>
//             ) : (
//               // Container running — full workspace (status bar is in the header)
//               <RemoteComputeWorkspace
//                 key={`remote-runtime-${runtimeEpoch}`}
//                 ref={gateway.workspaceRef}
//                 assetBaseUrl={remoteAssetBaseUrl}
//                 authContext={authContext}
//                 runtimeModeKey={`remote-mode-${runtimeEpoch}`}
//                 tenantId={authContext?.tenantId || 'default'}
//                 workspaceId={authContext?.workspaceId || 'workspace-default'}
//                 userId={authContext?.username || 'anonymous'}
//                 notebookName="remote-workspace"
//               />
//             )}
//           </>
//         ) : (
//           // Remote tier without micro-container (classic gateway-direct mode)
//           <RemoteComputeWorkspace
//             key={`remote-runtime-${runtimeEpoch}`}
//             ref={gateway.workspaceRef}
//             assetBaseUrl={remoteAssetBaseUrl}
//             authContext={authContext}
//             runtimeModeKey={`remote-mode-${runtimeEpoch}`}
//             tenantId={authContext?.tenantId || 'default'}
//             workspaceId={authContext?.workspaceId || 'workspace-default'}
//             userId={authContext?.username || 'anonymous'}
//             notebookName="remote-workspace"
//           />
//         )}
//       </SharedWorkspaceLayout>
//     </section>
//   );
// };
//
// export default HostedWorkspace;
