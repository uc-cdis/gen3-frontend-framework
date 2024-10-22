import { JSONObject } from '@gen3/core';

export interface ContentSource {
  get<T extends Record<string, undefined>>(filepath: string): Promise<T>;
}

interface Gen3Icon {
  body: string;
  width?: number;
  height?: number;
  top?: number;
  left?: number;
}

export interface RegisteredIcons {
  prefix: string;
  lastModified: number;
  icons: Record<string, Gen3Icon>;
  width: number;
  height: number;
}

export interface Fonts {
  heading: string | string[];
  content: string | string[];
  fontFamily: string;
}

export interface Gen3AppConfigData {
  version?: string;
  description?: string;
  schema?: JSONObject;
}
