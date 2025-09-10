import React, { ReactNode } from 'react';
import { RenderFactoryTypedInstance } from '../../../utils/RendererFactory';
import { Icon } from '@iconify-icon/react';
import Link from 'next/link';
import { filesize } from 'filesize';
import { isArray } from 'lodash';
import { Badge, Text } from '@mantine/core';
import { CellRendererFunction, CellRendererFunctionProps } from './types';
import {
  OpenControlledAccessCellRenderer,
  ProjectAccessCellRenderer,
} from './AccessCellRenderers';

export interface CellRendererFunctionCatalogEntry {
  [key: string]: CellRendererFunction;
}

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
  return <span>{cell.getValue() as ReactNode}</span>;
};

const FilesizeRenderer = ({ cell }: CellRendererFunctionProps) => {
  const value = cell.getValue();

  console.log('value', value);

  if (value == null) return <span>---</span>;

  // Handle numbers
  if (typeof value === 'number') {
    return Number.isFinite(value) ? (
      <span>{filesize(value)}</span>
    ) : (
      <span>---</span>
    );
  }

  // Handle bigints if present
  if (typeof value === 'bigint') {
    return <span>{filesize(value)}</span>;
  }

  // Handle numeric strings
  if (typeof value === 'string') {
    const n = Number(value.trim());
    return Number.isFinite(n) ? <span>{filesize(n)}</span> : <span>---</span>;
  }

  // Unsupported type
  return <span>---</span>;
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
        {cell.getValue() as ReactNode}{' '}
      </Text>
    </a>
  );
};

interface RenderNextLinkCellWithIconParams {
  baseURL?: string;
  icon?: string;
  size?: string;
  iconHeight?: string;
  linkField?: string; // field to use for link instead of cell value
  classNames?: {
    icon?: string;
    text?: string;
  };
}

const isRenderNextLinkCellWithIconParams = (
  value: unknown,
): value is RenderNextLinkCellWithIconParams => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const obj = value as Record<string, unknown>;

  return (
    (obj.baseURL === undefined || typeof obj.baseURL === 'string') &&
    (obj.icon === undefined || typeof obj.icon === 'string') &&
    (obj.size === undefined || typeof obj.size === 'string') &&
    (obj.linkField === undefined || typeof obj.linkField === 'string')
  );
};

const RenderLinkCellWithIcon = (
  { cell }: CellRendererFunctionProps,
  ...args: Array<Record<string, any>>
) => {
  let baseURL = '';
  let icon: string | null = null;
  let size = 'sm';
  let iconHeight = '1em';
  let linkField: string | undefined = undefined;
  let classNames: Partial<{
    icon: string;
    text: string;
  }> = {
    icon: '',
    text: '',
  };

  const params = args[0];
  if (isRenderNextLinkCellWithIconParams(params)) {
    baseURL = params.baseURL ?? baseURL;
    if (params.icon) {
      icon = params.icon;
    }
    size = params.size ?? size;
    iconHeight = params.iconHeight ?? iconHeight;
    linkField = params.linkField ?? undefined;
    classNames = params?.classNames ?? {
      icon: '',
      text: '',
    };
  }

  let linkURL = `${baseURL}${cell.getValue()}`;
  if (linkField) {
    const value = cell.row.original[linkField];
    if (typeof value === 'string') {
      linkURL = `${baseURL}${value}`;
    }
  }

  return (
    <Link href={linkURL} target="_blank" rel="noreferrer">
      <div className="flex items-center gap-1">
        {icon && <Icon height={iconHeight} icon={icon} />}
        <Text fw={700} size={size} classNames={{ root: classNames?.text }}>
          {cell.getValue() as ReactNode}
        </Text>
      </div>
    </Link>
  );
};

const RenderLinkCellUsingValueMap = (
  { cell }: CellRendererFunctionProps,
  ...args: Array<Record<string, unknown>>
) => {
  let href = null;
  if (
    typeof args[0] === 'object' &&
    Object.keys(args[0]).includes('valueToURL')
  ) {
    const linkMap = args[0].valueToURL as Record<string, string>;
    href = linkMap[cell.getValue() as string] ?? null;
  }
  if (!href) return <Text fw={700}> {cell.getValue() as ReactNode} </Text>;

  return (
    <a href={`${href}`} target="_blank" rel="noreferrer">
      <Text c="blue" td="underline" fw={700}>
        {' '}
        {cell.getValue() as ReactNode}{' '}
      </Text>
    </a>
  );
};

const LinkCellFunctionCatalog = {
  default: RenderLinkCell,
  linkWithValueMap: RenderLinkCellUsingValueMap,
  linkWithIcon: RenderLinkCellWithIcon,
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

      filesize: FilesizeRenderer,
    },
  });
  ExplorerTableCellRendererFactory().registerRendererCatalog({
    access: {
      projectAccess: ProjectAccessCellRenderer,
      openControlledAccess: OpenControlledAccessCellRenderer,
    },
  });
  ExplorerTableCellRendererFactory().registerRendererCatalog({
    array: ArrayCellFunctionCatalog,
  });
  ExplorerTableCellRendererFactory().registerRendererCatalog({
    link: LinkCellFunctionCatalog,
  });
};
