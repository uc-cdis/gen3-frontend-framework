export type StylingOverride = Record<string, string>;

export type StylingMergeMode = 'merge' | 'replace';

export type StylingOverrideWithMergeControl = StylingOverride & {
  mergeMode?: StylingMergeMode; // if undefined the default is 'merge'
};
