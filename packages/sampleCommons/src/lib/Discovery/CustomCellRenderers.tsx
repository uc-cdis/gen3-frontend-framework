import {
  DiscoveryCellRendererFactory,
  CellRenderFunctionProps,
} from '@gen3/frontend';
import { Badge, Text } from '@mantine/core';
import React from 'react';
import {
  MdOutlineCheckCircle as CheckCircleOutlined,
  MdOutlineRemoveCircleOutline as MinusCircleOutlined,
} from 'react-icons/md';
import { isArray } from 'lodash';

/**
 * Custom cell renderer for the linked study column for HEAL
 * @param cell
 */
export const LinkedStudyCell = ({ cell }: CellRenderFunctionProps) => {
  const value = cell.getValue() as boolean;
  return value ? (
    <Badge variant="outline" leftSection={<CheckCircleOutlined />} color="green">
      Linked
    </Badge>
  ) : (
    <Badge leftSection={<MinusCircleOutlined />} color="primary">
      Not Linked
    </Badge>
  );
};

const WrappedStringCell = ({ cell }: CellRenderFunctionProps, params :any[0]) => {
  const content = cell.getValue() as string | string[];
  return (
    <div className="w-40">
      <span className="break-words whitespace-break-spaces text-md">{isArray(content) ? content.join(', ') : content}</span>
    </div>
  );
};

const HEALCellRenderers = {
  string: {
    default: WrappedStringCell,
  },
  boolean: {
    LinkedStudyCell,
  }
};

/**
 * Register custom cell renderers for DiscoveryTable
 */
export const registerDiscoveryCustomCellRenderers = () => {
  DiscoveryCellRendererFactory.registerCellRendererCatalog(HEALCellRenderers);
};