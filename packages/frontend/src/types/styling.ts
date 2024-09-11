export type StylingOverride = Record<string, Record<string, string> | string>;

export type StylingMergeMode = 'merge' | 'replace' ;

export type StylingOverrideWithMergeControl = Record<string, string> & {
  mergeMode?: StylingMergeMode; // if undefined the default is merge
};
