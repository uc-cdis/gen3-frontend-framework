import { UserProfile, AuthzMapping } from '@gen3/core';

export type ActiveUser = Partial<UserProfile> & { active: boolean };

export const userCanRegisterStudy = (
  userInfo: ActiveUser,
  studyRegistrationAuthZ: any,
) => {
  const actions = (userInfo?.authz as AuthzMapping)[studyRegistrationAuthZ];
  const method = 'access';
  const service = 'study_registration';
  return (
    actions !== undefined &&
    actions.some(
      (x) =>
        (x.service === service || x.service === '*') &&
        (x.method === method || x.method === '*'),
    )
  );
};
