import { UserYaml, Authz } from './types';

export const convertUserYAMLToAuthz = (userYaml: UserYaml) : Authz => {
  // TODO: add populate of User and other fields
  return {
    users: userYaml.users,
    groups: userYaml.authz.groups,
    resources: userYaml.authz.resources,
    roles: userYaml.authz.roles,
    policies: userYaml.authz.policies
  } as Authz;
};
