import { JSONObject } from '@gen3/core';
import { Text, Tooltip } from '@mantine/core';
import { isArray } from 'lodash';
import React from 'react';
import { DataItemRendererFunction, DataItemRenderFunctionProps } from './types';
import { isTextTransform } from '../../utils';

export const TruncatedStringWithTooltip: DataItemRendererFunction = ({
  value,
  params,
}: DataItemRenderFunctionProps) => {
  let limit = 15;
  if (
    typeof params?.maxLength === 'string' &&
    !Number.isNaN(Number(params?.maxLength))
  ) {
    limit = parseInt(params?.maxLength, 10);
  } else if (typeof params?.maxLength === 'number') {
    limit = params?.maxLength;
  }

  const ttValue = isTextTransform(params?.transform)
    ? params?.transform
    : undefined;
  const valueIfNotAvailable = params?.valueIfNotAvailable ?? '';
  const content = value as string | string[];

  if (
    content === undefined ||
    content === null ||
    (isArray(content) && content.length === 0)
  ) {
    return <Text>{`${valueIfNotAvailable}`}</Text>;
  }

  if (content === '') {
    return <Text>{`${valueIfNotAvailable}`} </Text>;
  }
  const contentString = isArray(content) ? content.join(', ') : content;
  const truncated =
    contentString.length > limit
      ? `${contentString.slice(0, limit)}...`
      : contentString;
  return (
    <Tooltip label={content}>
      <Text tt={ttValue}>{truncated}</Text>
    </Tooltip>
  );
};
