import { RenderFactoryTypedInstance } from '../../../utils/RendererFactory';
import React, { ReactElement } from 'react';
import { isArray } from 'lodash';
import { Badge } from '@mantine/core';
import { MRT_Cell } from 'mantine-react-table';
import Link from 'next/link';

export interface CellRendererFunctionProps {
  cell: MRT_Cell;
  params?: any[];
}

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
  ...args: any[]
) => {
  return (
    <Link href={`${args[0].baseURL}/${cell.getValue()}`}>
      {cell.getValue() as ReactElement}
    </Link>
  );
};

const LinkCellFunctionCatalog = {
  default: RenderLinkCell,
};

let instance: RenderFactoryTypedInstance<CellRendererFunctionProps>;

const ExplorerTableRendererFactory =
  (): RenderFactoryTypedInstance<CellRendererFunctionProps> => {
    if (!instance) {
      instance = new RenderFactoryTypedInstance<CellRendererFunctionProps>();
      // register default cell renderers
      instance.registerCellRendererCatalog({
        value: {
          default: ValueCellRenderer,
        },
      });
      instance.registerCellRendererCatalog({ array: ArrayCellFunctionCatalog });
      instance.registerCellRendererCatalog({ link: LinkCellFunctionCatalog });
      instance.setDefaultRenderer(ValueCellRenderer);
    }
    return instance;
  };

export default ExplorerTableRendererFactory;
