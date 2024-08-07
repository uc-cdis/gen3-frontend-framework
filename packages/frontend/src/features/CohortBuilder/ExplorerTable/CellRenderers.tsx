import { MRT_Cell } from 'mantine-react-table';
import { isArray } from 'lodash';
import React, { ReactElement } from 'react';
import { Badge } from '@mantine/core';
import Link from 'next/link';

const NullCell = (): ReactElement => <span>NULL</span>;

interface CellRendererFunctionProps {
  cell: MRT_Cell;
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

export interface CellRendererFunctionCatalogEntry {
  [key: string]: CellRendererFunction;
}

const ArrayCellFunctionCatalog = {
  NegativePositive: RenderArrayCellNegativePositive,
  default: RenderArrayCell,
};

const RenderLinkCell = (
  { cell }: CellRendererFunctionProps,
  ...args: any[]
) => {
  if (!cell.getValue()) return <span />;
  return (
    <Link href={`${args[0].baseURL}/${cell.getValue()}`}>
      {cell.getValue() as ReactElement} --
      {args}
    </Link>
  );
};

const LinkCellFunctionCatalog = {
  default: RenderLinkCell,
};

class CellRendererFactory {
  private static instance: CellRendererFactory;
  private cellRendererCatalog: Record<
    string,
    CellRendererFunctionCatalogEntry
  > = {};

  private constructor() {
    this.cellRendererCatalog['array'] = ArrayCellFunctionCatalog;
    this.cellRendererCatalog['link'] = LinkCellFunctionCatalog;
  }

  static getInstance(): CellRendererFactory {
    if (!CellRendererFactory.instance) {
      CellRendererFactory.instance = new CellRendererFactory();
    }

    return CellRendererFactory.instance;
  }

  getCellRenderer(type: string, functionName: string): CellRendererFunction {
    return this.cellRendererCatalog[type][functionName] ?? RenderArrayCell;
  }
}

export const TableCellRenderer = (
  type: string,
  functionName = 'default',
  ...params: any[]
): CellRendererFunction => {
  switch (type) {
    case 'array': {
      const func = CellRendererFactory.getInstance().getCellRenderer(
        'array',
        functionName,
      );
      return (cell): ReactElement => func(cell);
    }
    case 'link': {
      const func = CellRendererFactory.getInstance().getCellRenderer(
        'link',
        functionName,
      );
      return (cell): ReactElement => func(cell, ...params);
    }
    default:
      return ValueCellRenderer;
  }
};
