import type { UserProfile, AuthzMapping } from '@gen3/core';

export type ActiveUser = Partial<UserProfile> & { active: boolean };

export const userCanRegisterStudy = (
  userInfo: ActiveUser | undefined,
  studyRegistrationAuthZ: string | undefined,
) => {
  const actions =
    userInfo?.authz && studyRegistrationAuthZ
      ? (userInfo.authz as AuthzMapping)[studyRegistrationAuthZ]
      : undefined;
  const method = 'access';
  const service = 'study_registration';
 return (
  actions?.some(
    (x) =>
      (x.service === service || x.service === '*') &&
      (x.method === method || x.method === '*'),
  ) ?? false
);
};
