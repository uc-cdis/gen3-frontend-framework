import { isArray, toString } from 'lodash';
import React, { CSSProperties } from 'react';
import { Badge, Text } from '@mantine/core';
import Link from 'next/link';
import { DiscoveryCellRendererFactory } from './CellRendererFactory';
import { getTagInfo } from '../utils';
import { useDiscoveryContext } from '../DiscoveryProvider';
import { CellRendererFunction, CellRenderFunctionProps } from './types';
import { DataAccessCellRenderer } from './DataAccessCellRenderers';
import { TruncatedStringWithTooltip } from '../../../components/DataItems/TruncatedStringWithTooltip';
import { JSONObject } from '@gen3/core';

import { getParamsValueAsString } from '../../../utils/values';

const TruncatedStringWithTooltipCellRenderer: CellRendererFunction = (
  { value }: CellRenderFunctionProps,
  params?: JSONObject,
) => {
  return <TruncatedStringWithTooltip value={value} params={params} />;
};

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

// Define the valid textTransform values
const validTextTransforms: Array<CSSProperties['textTransform']> = [
  'none',
  'capitalize',
  'uppercase',
  'lowercase',
  'full-width',
  'full-size-kana',
  'inherit',
  'initial',
  'revert',
  'unset',
];

// Type guard function
const isTextTransform = (
  value: any,
): value is CSSProperties['textTransform'] => {
  return validTextTransforms.includes(value);
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

const RenderYearOfBirthRestricted: CellRendererFunction = (
  { value }: CellRenderFunctionProps,
  params?: JSONObject,
) => {
  const ttValue = isTextTransform(params?.transform)
    ? params?.transform
    : undefined;
  const valueIfNotAvailable = params?.valueIfNotAvailable || '';
  const content = value as string | string[];
  if (content === undefined || content === null) {
    return <Text>{`${valueIfNotAvailable}`} </Text>;
  }
  if (content == '') {
    return <Text>{`${valueIfNotAvailable}`} </Text>;
  }

  // Check if the content is a string and represents a year less than 1935
  let displayContent;
  if (
    typeof content === 'string' &&
    !Number.isNaN(Number(content)) &&
    Number(content) < 1935
  ) {
    displayContent = '1935';
  } else if (isArray(content)) {
    displayContent = content
      .map((item) => {
        if (
          typeof item === 'string' &&
          !Number.isNaN(Number(item)) &&
          Number(item) < 1935
        ) {
          return '1935';
        }
        return item;
      })
      .join(', ');
  } else {
    displayContent = content;
  }

  return <Text tt={ttValue}>{displayContent}</Text>;
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
  const ttValue = isTextTransform(params?.transform)
    ? params?.transform
    : undefined;
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
  const ttValue = isTextTransform(params?.transform)
    ? params?.transform
    : undefined;
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
    <div className="flex space-x-1 space-y-4">
      {content.map((x: TagData) => {
        const { color, display, label } = getTagInfo(x, config.tags);
        if (!display) return null;
        return (
          <Badge
            key={x.name}
            role="button"
            size="lg"
            radius="sm"
            variant="filled"
            tabIndex={0}
            aria-label={x.name}
            style={{
              backgroundColor: color,
              borderColor: color,
              color: 'white',
            }}
          >
            {label}
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
    yearOfBirthRestricted: RenderYearOfBirthRestricted,
    truncated: TruncatedStringWithTooltipCellRenderer,
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
