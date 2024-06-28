export interface ContentSource {
  get<T extends Record<string, undefined>>(filepath: string): Promise<T>;
  getAll<T extends Record<string, unknown>>(
    filepath: string,
    filter: string,
  ): Promise<Array<T>>;
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
