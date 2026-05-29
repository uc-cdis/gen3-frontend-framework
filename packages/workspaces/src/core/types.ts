interface ProcessProxyConfig {
  image_name: string;
}

interface ProcessProxy {
  class_name: string;
  config: ProcessProxyConfig;
}

interface KernelSpecMetadata {
  costPerHour: number;
  debugger: boolean;
  nodeType: string;
  process_proxy: ProcessProxy;
}

interface KernelSpec {
  argv: string[];
  display_name: string;
  env: Record<string, string>;
  interrupt_mode: string;
  language: string;
  metadata: KernelSpecMetadata;
}

interface KernelSpecResources {
  'logo-64x64': string;
}

interface KernelSpecEntryMetadata {
  name: string;
  resources: KernelSpecResources;
  spec: KernelSpec;
}

interface KernelSpecs {
  [kernelName: string]: KernelSpecEntryMetadata;
}

export interface KernelSpecsResponse {
  default: string;
  kernelspecs: KernelSpecs;
}

/* The Kernal type the frontend uses to represent a kernel spec entry */
export interface KernelSpecEntry {
  name: string;
  displayName: string;
  language?: string;
  /** Cost per hour from KernelSpecPolicy. 0 = included. Injected by kernel lifecycle proxy. */
  costPerHour?: number;
  /** Display tier from KernelSpecPolicy. e.g. "micro" | "gpu" */
  nodeType?: string;
  /** CPU allocation (e.g. "4" cores). From JEG resources or policy. */
  cpu?: string;
  /** Memory allocation (e.g. "16Gi"). From JEG resources or policy. */
  memory?: string;
  /** GPU type/size (e.g. "NVIDIA A100 40GB"). From JEG resources or policy. */
  gpuType?: string;
}

export interface KernelRow {
  kernelId: string;
  kernelName?: string;
  executionState?: string;
  /** How long the kernel has been alive, in minutes. */
  uptimeMinutes?: number | null;
  staleState?: 'healthy' | 'warning' | 'kill';
  idleDays?: number | null;
}
