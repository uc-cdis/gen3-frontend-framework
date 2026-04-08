import React from 'react';
import { FieldRendererFunction } from '../RendererFactory';
import { JSONObject, JSONValue } from '@gen3/core';
import { Alert } from '@mantine/core';
import { accessibleFieldName, AccessLevel } from '../../../../../utils';

const AccessDescriptor: FieldRendererFunction = (
  resource: JSONValue,
  _: string | undefined,
) => {
  if (
    resource === null ||
    typeof resource !== 'object' /*
    COMMENTING THIS OUT WILL BE IMPLEMENTED UNTIL HP-2378
    ||
    !(accessibleFieldName in resource) */
  ) {
    return <></>;
  }

  if (
    (resource as JSONObject)[accessibleFieldName] === AccessLevel.ACCESSIBLE
  ) {
    return <Alert color="green">You have access to this study.</Alert>;
  }
  if (
    (resource as JSONObject)[accessibleFieldName] === AccessLevel.UNACCESSIBLE
  ) {
    return <Alert color="red">You do not have access to this study.</Alert>;
  }
  return (
    <Alert color="yellow">
      This study does not include data access authorization details.
    </Alert>
  );
};

export default AccessDescriptor;
