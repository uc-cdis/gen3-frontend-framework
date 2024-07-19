import { isArray, toString } from 'lodash';
import React from 'react';
import { Badge, Text } from '@mantine/core';
import Link from 'next/link';
import { DiscoveryCellRendererFactory } from './CellRendererFactory';
import { getTagColor } from '../utils';
import { useDiscoveryContext } from '../DiscoveryProvider';
import { CellRendererFunction, CellRenderFunctionProps } from './types';
import { DataAccessCellRenderer } from './DataAccessCellRenderers';
import { JSONObject } from '@gen3/core';

import { getParamsValueAsString } from '../../../utils/values';

// TODO need to type this
export const RenderArrayCell: CellRendererFunction = ({
  value,
}: CellRenderFunctionProps) => {
  if (isArray(value)) {
    return (
      <div className="w-64 flex flex-wrap gap-0.5">
        {value.map((x, index) => (
          <Badge
            variant="outline"
            classNames={{ root: 'basis-1/3' }}
            color="accent-light"
            key={`${x}-value-${index}`}
          >
            {x}
          </Badge>
        ))}
      </div>
    );
  }
  return <span>value</span>;
};

export const RenderArrayCellNegativePositive: CellRendererFunction = ({
  value,
  cell,
}: CellRenderFunctionProps) => {
  if (isArray(value)) {
    return (
      <div className="w-64 flex flex-wrap gap-0.5">
        {value.map((x, index) => (
          <Badge
            variant="filled"
            color={x === 'Positive' ? 'green' : 'gray'}
            classNames={{ root: 'basis-1/3' }}
            key={`${cell?.id ?? 'cell'}-value-${index}`}
          >
            {x}
          </Badge>
        ))}
      </div>
    );
  }
  // TODO: This is a hack to get around the fact that the data is not typed
  return <span>{value as any}</span>;
};

export const RenderLinkCell: CellRendererFunction = ({
  value,
}: CellRenderFunctionProps) => {
  const content = value as string;
  return (
    <Link
      href={content}
      onClick={(ev) => ev.stopPropagation()}
      target="_blank"
      rel="noreferrer"
    >
      {content}
    </Link>
  );
};

// given a field name, extract the value from the row using the type guards above

export const RenderLinkWithURL: CellRendererFunction = (
  { value, cell }: CellRenderFunctionProps,

  params?: JSONObject,
) => {
  const content = toString(value);
  if (!content) {
    return (
      <Text>{`${
        getParamsValueAsString(params, 'valueIfNotAvailable') ?? ''
      }`}</Text>
    );
  }
  const ttValue = params?.transform || undefined;
  const rowData = getParamsValueAsString(
    cell?.row?.original,
    toString(params?.['hrefValueFromField']),
  );
  if (rowData) {
    return (
      <a
        href={`http://${rowData}`}
        onClick={(ev) => ev.stopPropagation()}
        target="_blank"
        rel="noreferrer"
      >
        <Text c="utility.0" tt={ttValue}>
          {content}
        </Text>
      </a>
    );
  }
  return (
    <a
      href={`http://${content}`}
      onClick={(ev) => ev.stopPropagation()}
      target="_blank"
      rel="noreferrer"
    >
      <Text c="utility.0" tt={ttValue}>
        {content} fgh
      </Text>
    </a>
  );
};

const RenderStringCell: CellRendererFunction = (
  { value }: CellRenderFunctionProps,
  params?: JSONObject,
) => {
  const ttValue = params?.transform || undefined;
  const valueIfNotAvailable = params?.valueIfNotAvailable || '';
  const content = value as string | string[];
  if (content === undefined || content === null) {
    return <Text>{`${valueIfNotAvailable}`} </Text>;
  }
  if (content == '') {
    return <Text>{`${valueIfNotAvailable}`} </Text>;
  }
  return (
    <Text tt={ttValue}>{isArray(content) ? content.join(', ') : content}</Text>
  );
};

const RenderNumberCell: CellRendererFunction = (
  { value }: CellRenderFunctionProps,
  params?: JSONObject,
) => {
  const isContentEmpty = value === undefined || value === null;
  const paramsValueIfNotAvailable = params?.valueIfNotAvailable || '';
  const content = value as number | number[];

  if (isContentEmpty) {
    return <Text>{`${paramsValueIfNotAvailable}`}</Text>;
  }

  let stringValue = '';
  // check if content is an array of all numbers
  if (isArray(content) && content.every((item) => typeof item === 'number')) {
    stringValue = content.map((v) => (v ? v.toLocaleString() : '')).join('; ');
  } else {
    stringValue = content.toLocaleString();
  }

  return <Text>{stringValue}</Text>;
};

const RenderParagraphsCell: CellRendererFunction = ({
  value,
}: CellRenderFunctionProps) => {
  const content = value as string | string[];
  return (
    <React.Fragment>
      {isArray(content)
        ? content
            .join('\n')
            .split('\n')
            .map((paragraph, i) => <p key={i}>{paragraph}</p>)
        : content.split('\n').map((paragraph, i) => <p key={i}>{paragraph}</p>)}
    </React.Fragment>
  );
};

// TODO This is likely to be replaced by a more general tag component
interface TagData {
  name: string;
  category: string;
}

// TODO Fix below
// eslint-disable-next-line react/prop-types
export const RenderTagsCell: CellRendererFunction = ({
  value,
}: CellRenderFunctionProps) => {
  const content = value as TagData[];
  const { discoveryConfig: config } = useDiscoveryContext();
  return (
    <div className="flex space-x-1 ">
      {content.map(({ name, category }: TagData) => {
        const color = getTagColor(category, config.tagCategories);
        return (
          <Badge
            key={name}
            role="button"
            size="lg"
            radius="sm"
            variant="filled"
            tabIndex={0}
            aria-label={name}
            style={{
              backgroundColor: color,
              borderColor: color,
              color: 'white',
            }}
          >
            {name}
          </Badge>
        );
      })}
    </div>
  );
};

export const Gen3DiscoveryStandardCellRenderers = {
  array: {
    NegativePositive: RenderArrayCellNegativePositive,
    default: RenderArrayCell,
  },
  string: {
    default: RenderStringCell,
  },
  number: {
    default: RenderNumberCell,
  },
  paragraphs: {
    default: RenderParagraphsCell,
  },
  tags: {
    default: RenderTagsCell,
  },
  link: {
    default: RenderLinkCell,
    withURL: RenderLinkWithURL,
  },
  dataAccess: {
    default: DataAccessCellRenderer,
  },
};

export const registerDiscoveryDefaultCellRenderers = () => {
  DiscoveryCellRendererFactory.registerCellRendererCatalog(
    Gen3DiscoveryStandardCellRenderers,
  );
};
