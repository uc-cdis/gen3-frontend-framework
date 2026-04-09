import React from 'react';
import { FieldRendererFunction } from '../RendererFactory';
import { JSONObject, JSONValue } from '@gen3/core';
import { Alert } from '@mantine/core';
import { accessibleFieldName, AccessLevel } from '../../../../../utils';

/**
 * Renders an AccessDescriptor based resource data accessibleFieldName value
 *
 * @param {JSONValue} resource - JSON object containing the data from which the field's value is extracted.
 * @returns {ReactElement | null} A React element showing the user's access
 */
const AccessDescriptor: FieldRendererFunction = (resource: JSONValue) => {
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
