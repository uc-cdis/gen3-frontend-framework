import {
  CellRendererFunctionProps,
  RenderFactoryTypedInstance,
} from '../../../utils/RendererFactory';
import React, { ReactElement } from 'react';
import { isArray } from 'lodash';
import { Badge, Text } from '@mantine/core';

export interface CellRendererFunctionCatalogEntry {
  [key: string]: CellRendererFunction;
}

export type CellRendererFunction = (
  props: CellRendererFunctionProps,
  ...args: any[]
) => ReactElement;
// TODO need to type this
export const RenderArrayCell: CellRendererFunction = ({
  cell,
}: CellRendererFunctionProps) => {
  const value = cell.getValue();
  if (isArray(value)) {
    return (
      <div className="w-64 flex flex-wrap gap-0.5">
        {value.map((x, index) => (
          <Badge
            variant="outline"
            classNames={{ root: 'basis-1/3' }}
            color="accent-light"
            key={`${cell.id}-value-${index}`}
          >
            {x}
          </Badge>
        ))}
      </div>
    );
  }
  return <span>value</span>;
};

export const RenderArrayCellNegativePositive = ({
  cell,
}: CellRendererFunctionProps) => {
  const value = cell.getValue();
  if (isArray(value)) {
    return (
      <div className="w-64 flex flex-wrap gap-0.5">
        {value.map((x, index) => (
          <Badge
            variant="filled"
            color={x === 'Positive' ? 'green' : 'gray'}
            classNames={{ root: 'basis-1/3' }}
            key={`${cell.id}-value-${index}`}
          >
            {x}
          </Badge>
        ))}
      </div>
    );
  }
  return <span>value</span>;
};

const ValueCellRenderer = ({ cell }: CellRendererFunctionProps) => {
  return <span>{cell.getValue() as ReactElement}</span>;
};

const ArrayCellFunctionCatalog = {
  NegativePositive: RenderArrayCellNegativePositive,
  default: RenderArrayCell,
};

const RenderLinkCell = (
  { cell }: CellRendererFunctionProps,
  ...args: Array<Record<string, unknown>>
) => {
  return (
    <a
      href={`${args[0].baseURL}${cell.getValue()}`}
      target="_blank"
      rel="noreferrer"
    >
      <Text c="blue" td="underline" fw={700}>
        {' '}
        {cell.getValue() as ReactElement}{' '}
      </Text>
    </a>
  );
};

const LinkCellFunctionCatalog = {
  default: RenderLinkCell,
};

let instance: RenderFactoryTypedInstance<CellRendererFunctionProps>;

export const ExplorerTableCellRendererFactory =
  (): RenderFactoryTypedInstance<CellRendererFunctionProps> => {
    if (!instance) {
      instance = new RenderFactoryTypedInstance<CellRendererFunctionProps>();
    }
    return instance;
  };

// register default cell renderers
export const registerExplorerDefaultCellRenderers = () => {
  ExplorerTableCellRendererFactory().registerRendererCatalog({
    value: {
      default: ValueCellRenderer,
    },
  });
  ExplorerTableCellRendererFactory().registerRendererCatalog({
    array: ArrayCellFunctionCatalog,
  });
  ExplorerTableCellRendererFactory().registerRendererCatalog({
    link: LinkCellFunctionCatalog,
  });
};
