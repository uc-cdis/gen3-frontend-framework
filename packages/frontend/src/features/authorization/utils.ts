
import { type AuthzMapping } from '@gen3/core';

export const userHasMethodForServiceOnResource = (method: string, service : string, resourcePath: string, userAuthMapping : AuthzMapping = {}) => {
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
