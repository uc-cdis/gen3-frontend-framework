import { DiscoveryCellRendererFactory } from '@gen3/frontend/features/Discovery/DiscoveryTable/TableRenderers/CellRendererFactory';
import { CellRenderFunctionProps } from '@gen3/frontend/features/Discovery/DiscoveryTable/TableRenderers/types';
import { Badge, Text } from '@mantine/core';
import React from 'react';
import {
  MdOutlineCheckCircle as CheckCircleOutlined,
  MdOutlineRemoveCircleOutline as MinusCircleOutlined,
} from 'react-icons/md';
import { isArray, toString } from 'lodash';
import { JSONObject } from '@gen3/core';
import { FilemapInline, FilemapPopup } from '@/lib/Discovery/Filemap';

/**
 * Custom cell renderer for the linked study column for HEAL
 * @param cell
 */
export const LinkedStudyCell = ({
  value: cellValue,
}: CellRenderFunctionProps<boolean>) => {
  const value = cellValue as boolean;
  return value ? (
    <Badge
      variant="outline"
      leftSection={<CheckCircleOutlined />}
      color="green"
    >
      Linked
    </Badge>
  ) : (
    <Badge leftSection={<MinusCircleOutlined />} color="primary">
      Not Linked
    </Badge>
  );
};

const WrappedStringCell = (
  { value }: CellRenderFunctionProps,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  params?: JSONObject,
) => {
  if (value === undefined || value === null || toString(value) === '') {
    return (
      <Text>
        {`${
          params && params?.valueIfNotAvailable
            ? params?.valueIfNotAvailable
            : ''
        }`}
      </Text>
    );
  }

  const content = value as string | string[];
  return (
    <div className="w-40">
      <span className="break-words whitespace-break-spaces text-md">
        {isArray(content) ? content.join(', ') : content}
      </span>
    </div>
  );
};

/**
 * Register custom cell renderers for DiscoveryTable
 */
export const registerDiscoveryCustomCellRenderers = () => {
  DiscoveryCellRendererFactory.registerCellRendererCatalog({
    string: {
      default: WrappedStringCell,
    },
    boolean: {
      LinkedStudyCell,
    },
    manifest: {
      default: FilemapPopup,
      inline: FilemapInline,
    },
  });
};
