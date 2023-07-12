
/**
 * A registry for the Gen3 Apps.
 */
export const REGISTRY: Record<string, React.ReactNode> = {};

export const registerGen3App = (id: string, gen3App: React.ReactNode): void => {
  REGISTRY[id] = gen3App;
};

export const lookupGen3App = (id: string): React.ReactNode => {
  return REGISTRY[id];
};

export const computeGen3AppId = (name: string, version: string): string => {
  return `${name}@${version}`;
}
