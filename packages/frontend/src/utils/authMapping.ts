import { UserAuthMapping } from "../features/Discovery/types";


export const resourcePathFromProjectID = (projectID: string) => {
  const split = projectID.split('-');
  const program = split[0];
  const project = split.length > 1 ? split.slice(1).join('-') : '';
  return `/programs/${program}/projects/${project}`;
};

export const userHasMethodForServiceOnResource = (method : string, service : string, resourcePath : string, userAuthMapping : Record<string, Array<UserAuthMapping>> = {}) => {
  const actions = userAuthMapping[resourcePath];
  // accommodate for '*' logic
  // if we need to check for a specific service/method pair for a resource,
  // e.g.: {service: sheepdog, method: update}
  // then this function should return true if the user has either of
  // the following pair for this policy
  // 1. {service: sheepdog, method: update}
  // 2. {service: sheepdog, method: *}
  // 3. {service: *, method: update}
  // 4. {service: *, method: *}
  return actions !== undefined && actions.some((x) => ((x.service === service || x.service === '*') && (x.method === method || x.method === '*')));
};
