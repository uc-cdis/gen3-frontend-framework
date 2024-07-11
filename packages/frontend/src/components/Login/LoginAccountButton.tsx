import React from 'react';
import { UnstyledButton } from '@mantine/core';
import { useRouter } from 'next/router';
import {
  selectUserAuthStatus,
  selectUserDetails,
  useCoreSelector,
  isAuthenticated,
  type CoreState,
} from '@gen3/core';
import { useDeepCompareEffect } from 'use-deep-compare';

const LoginAccountButton = () => {
  const router = useRouter();

  const handleSelected = async () => {
    await router.push('Profile');
  };

  const userStatus = useCoreSelector((state: CoreState) =>
    selectUserAuthStatus(state),
  );
  const userInfo = useCoreSelector((state: CoreState) =>
    selectUserDetails(state),
  );

  console.log('user status', userStatus);

  useDeepCompareEffect(() => {
    console.log('user status changed', userStatus);
  }, [userStatus]);

  return userStatus && isAuthenticated(userStatus) ? (
    <UnstyledButton className="mx-2" onClick={() => handleSelected()}>
      <div className="flex flex-nowrap items-center align-middle border-b-2 hover:border-accent border-transparent">
        {userInfo?.username}
      </div>
    </UnstyledButton>
  ) : null;
};

export default LoginAccountButton;
