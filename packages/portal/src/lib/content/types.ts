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

export interface Gen3AppPlugin {
  name: string;
  package: string;
  register?: () => void;
}

export interface Gen3CommonsConfiguration {
  commons_url: string;
  icons: RegisteredIcons;
  colors: Record<string, string>;
  plugins: ReadonlyArray<Gen3AppPlugin>;
}
