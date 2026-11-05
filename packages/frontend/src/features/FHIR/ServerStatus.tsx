import React, { type ReactElement } from 'react';
import { Badge } from '@mantine/core';
import { GEN3_FHIR_API, useGetFhirCapabilityQuery } from '@gen3/core';
import { useOrigin } from './hooks';
import { hostOf, toAbsoluteUrl } from './utils';

const statusOf = (isSuccess: boolean, isError: boolean) => {
  if (isError) return { dot: 'bg-red-500', text: 'FHIR server unreachable' };
  if (isSuccess) return { dot: 'bg-green-500', text: 'FHIR server connected' };
  return { dot: 'bg-gray-300', text: 'Checking FHIR server' };
};

// Green once /metadata loads.
const ServerStatus = (): ReactElement => {
  const origin = useOrigin();
  const { isSuccess, isError } = useGetFhirCapabilityQuery();
  const { dot, text } = statusOf(isSuccess, isError);

  return (
    <Badge
      variant="outline"
      color="gray"
      size="lg"
      radius="xl"
      tt="none"
      fw={400}
      title={text}
      leftSection={<span className={`block h-2 w-2 rounded-full ${dot}`} />}
    >
      <span className="sr-only">{text}: </span>
      {hostOf(toAbsoluteUrl(GEN3_FHIR_API, origin))}
    </Badge>
  );
};

export default ServerStatus;
