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
