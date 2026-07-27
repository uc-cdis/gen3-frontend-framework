import React, { ReactNode } from 'react';
import { CellRendererFunctionProps } from './types';
import { ActionIcon } from '@mantine/core';
import { FaExternalLinkAlt } from 'react-icons/fa';
import { useRouter } from 'next/router';
import { removeMultipleSlashes } from '../../../utils';

// TODO: move additional Link renderers to here

interface OpenAppLinkOptions {
  baseUrl: string;
  color: string;
  variant: string;
  size: string;
  tooltip: string;
  filter?: {
    field: string;
    value: string;
  };
}

const RenderOpenAppLinkDefaultParameters: OpenAppLinkOptions = {
  baseUrl: '',
  color: 'accent.4',
  variant: 'filled',
  size: 'md',
  tooltip: '',
};

/**
 * RenderLinkWithIcon is a functional component that renders a hyperlink with an associated icon inside a tooltip.
 *
 * This component primarily checks if a value exists in the `cell` object provided as a property. If there is no
 * value or the value is an empty string, it returns an empty span. Otherwise, a link is rendered with customizable
 * icon appearance and tooltip functionality.
 *
 * Parameters for styling and behavior can be passed through `params`, which override the default configurations.
 *
 * @param {Object} props - The component props.
 * @param {CellRendererFunctionProps} props.cell - Contains the value for the hyperlink.
 * @param {...Array<Record<string, unknown>>} params - Additional configuration parameters for the rendered link and its icon. Defaults are defined in `RenderLinkIconDefaultParameters`.
 * @returns {React.ReactNode} A React element representing a tooltip-wrapped link with an icon, or an empty span if no value is present in `cell`.
 */
export const RenderOpenAppLink = (
  { cell, row }: CellRendererFunctionProps,
  ...params: Array<Record<string, string>>
) => {
  const router = useRouter();

  if (!cell?.getValue() || cell?.getValue() === '') {
    return <span></span>;
  }

  const mergedParams = {
    ...RenderOpenAppLinkDefaultParameters,
    ...(params ? params[0] : {}),
  };
  const {
    variant,
    color = 'accent.4',
    size = 12,
    // oxlint-disable-next-line no-unused-vars
    tooltip = '',
    baseUrl,
    filter,
  } = mergedParams;

  let rowMatchesFilter = true;
  if (filter) {
    rowMatchesFilter = row?.original?.[filter.field] === filter.value;
  }

  if (cell?.getValue() && !rowMatchesFilter) {
    return <span>{cell.getValue() as string}</span>;
  } else {
    const url = removeMultipleSlashes(`${baseUrl}${cell.getValue()}`);
    return (
      <div className="flex flex-nowrap items-center align-middle gap-2">
        <ActionIcon
          size={size}
          variant={variant}
          color={color}
          onClick={() => router.push(url)}
        >
          <FaExternalLinkAlt />
        </ActionIcon>
        <span>{cell.getValue() as string}</span>
      </div>
    );
  }
};
