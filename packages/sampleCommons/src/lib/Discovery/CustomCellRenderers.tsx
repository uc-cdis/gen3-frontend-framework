import {
  DiscoveryCellRendererFactory,
  CellRenderFunctionProps,
} from '@gen3/frontend';
import { Badge } from '@mantine/core';
import React from 'react';
import {
  MdOutlineCheckCircle as CheckCircleOutlined,
  MdOutlineRemoveCircleOutline as MinusCircleOutlined,
} from 'react-icons/md';

/**
 * Custom cell renderer for the linked study column for HEAL
 * @param cell
 */
export const LinkedStudyCell = ({ cell }: CellRenderFunctionProps) => {
  const value = cell.getValue() as boolean;
  return value ? (
    <Badge leftSection={<CheckCircleOutlined />} color="green">
      Linked
    </Badge>
  ) : (
    <Badge leftSection={<MinusCircleOutlined />} color="primary">
      Not Linked
    </Badge>
  );
};

/**
 * Register custom cell renderers for DiscoveryTable
 */
export const registerDiscoveryCustomCellRenderers = () => {
  DiscoveryCellRendererFactory.registerCellRenderer(
    'boolean',
    'LinkedStudyCell',
    LinkedStudyCell,
  );
};
