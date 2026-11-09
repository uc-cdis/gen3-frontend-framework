import type { ReactNode } from 'react';
import { Popover } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

interface ConditionalPopoverProps {
  readonly noData: boolean;
  readonly userHasAccessToDownload: boolean;
  readonly missingRequiredIdentityProviders: readonly string[];
  readonly children: ReactNode;
}

const getPopoverMessage = (
  noData: boolean,
  userHasAccessToDownload: boolean,
  missingRequiredIdentityProviders: readonly string[],
): string | undefined => {
  if (noData) {
    return 'The file is not available for the selected study';
  }
  if (!userHasAccessToDownload) {
    return "You don't have access to this data";
  }
  if (missingRequiredIdentityProviders.length) {
    return missingRequiredIdentityProviders.length > 1
      ? `Data selection requires [${missingRequiredIdentityProviders.join(', ')}] credentials to access. Please change selection to only need one set of credentials and log in using appropriate credentials`
      : `This dataset is only accessible to users who have authenticated via ${missingRequiredIdentityProviders[0]}. Please log in using the ${missingRequiredIdentityProviders[0]} option.`;
  }
  return undefined;
};

const ConditionalPopover = ({
  noData,
  userHasAccessToDownload,
  missingRequiredIdentityProviders,
  children,
}: ConditionalPopoverProps) => {
  const [opened, { close, open }] = useDisclosure(false);
  const message = getPopoverMessage(
    noData,
    userHasAccessToDownload,
    missingRequiredIdentityProviders,
  );

  // Do not render the popover if there's no message
  if (!message) {
    return <>{children}</>;
  }

  return (
    <Popover position="top" withArrow shadow="md" opened={opened}>
      <Popover.Target>
        <div onMouseEnter={open} onMouseLeave={close}>
          {children}
        </div>
      </Popover.Target>
      <Popover.Dropdown maw={300} style={{ pointerEvents: 'none' }}>
        {message}
      </Popover.Dropdown>
    </Popover>
  );
};

export default ConditionalPopover;
