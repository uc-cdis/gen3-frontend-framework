export const resourcePathFromProjectID = (projectID: string): string => {
  const split = projectID.split('-');
  const program = split[0];
  const project = split.slice(1).join('-');
  const resourcePath = ['/programs', program, 'projects', project].join('/');
  return resourcePath;
};

export const isRootUrl = (urlFragment: string): boolean => urlFragment === '_root';

export const isProgramUrl = (urlFragment: string): boolean => urlFragment !== '_root' && !urlFragment.includes('-');

export const userHasSheepdogProgramAdmin = (userAuthMapping: Record<string, any> = {}): boolean => userAuthMapping['/services/sheepdog/submission/program'] !== undefined;

export const userHasSheepdogProjectAdmin = (userAuthMapping: Record<string, any> = {}): boolean => userAuthMapping['/services/sheepdog/submission/project'] !== undefined;

export const projectCodeFromResourcePath = (resourcePath: string): string => {
  const split = resourcePath.split('/');
  return (split.length < 5 || split[1] !== 'programs' || split[3] !== 'projects') ? '' : split[4];
};

export const listifyMethodsFromMapping = (actions: { service: string, method: string }[]): string[] => {
  const reducer = (accumulator: string[], currval: { service: string, method: string }): string[] => accumulator.concat([currval.method]);
  return actions.reduce(reducer, []);
};

export const userHasDataUpload = (userAuthMapping: Record<string, any> = {}): boolean => {
  const actionIsFileUpload = (x: { method: string }): boolean => x.method === 'file_upload';
  const resource = userAuthMapping['/data_file'];
  return resource !== undefined && resource.some(actionIsFileUpload);
};

export const userHasMethodForServiceOnResource = (method: string, service: string, resourcePath: string, userAuthMapping: Record<string, any> = {}): boolean => {
  const actions = userAuthMapping[resourcePath];
  return actions !== undefined && actions.some((x: { service: string, method: string }) => ((x.service === service || x.service === '*') && (x.method === method || x.method === '*')));
};

export const userHasMethodForServiceOnProject = (method: string, service: string, projectID: string, userAuthMapping: Record<string, any> = {}): boolean => {
  const resourcePath = resourcePathFromProjectID(projectID);
  return userHasMethodForServiceOnResource(method, service, resourcePath, userAuthMapping);
};

export const userHasMethodOnAnyProject = (method: string, userAuthMapping: Record<string, any> = {}): boolean => {
  const actionHasMethod = (x: { method: string }): boolean => (x.method === method);
  const actionArrays = Object.values(userAuthMapping);
  const hasMethod = actionArrays.some((x: { method: string }[]) => x.some(actionHasMethod));
  return hasMethod;
};

export const userHasCreateOrUpdateOnAnyProject = (userAuthMapping: Record<string, any> = {}): boolean => (userHasMethodOnAnyProject('create', userAuthMapping)
  || userHasMethodOnAnyProject('update', userAuthMapping));
