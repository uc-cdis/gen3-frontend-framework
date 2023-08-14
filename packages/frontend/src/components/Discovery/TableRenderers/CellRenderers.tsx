import { isArray } from 'lodash';
import React, { useContext } from 'react';
import { Badge, Text } from '@mantine/core';
import Link from 'next/link';
import { DiscoveryCellRendererFactory } from './CellRendererFactory';
import { getTagColor } from '../utils';
import { DiscoveryConfigContext } from '../DiscoveryConfigProvider';
import { CellRendererFunction, CellRenderFunctionProps } from './types';

// TODO need to type this
export const RenderArrayCell: CellRendererFunction = ({
  cell,
}: CellRenderFunctionProps) => {
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
}: CellRenderFunctionProps) => {
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
  // TODO: This is a hack to get around the fact that the data is not typed
  return <span>{value as any}</span>;
};

export const RenderLinkCell = ({ cell }: CellRenderFunctionProps) => {
  const content = cell.getValue() as string;
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

const RenderStringCell = ({ cell }: CellRenderFunctionProps) => {
  const content = cell.getValue() as string | string[];
  return <Text>{isArray(content) ? content.join(', ') : content}</Text>;
};

const RenderNumberCell = ({ cell }: CellRenderFunctionProps) => {
  const content = cell.getValue() as number | number[];
  return (
    <Text>
      {isArray(content)
        ? content.map((v) => v.toLocaleString()).join('; ')
        : content.toLocaleString()}
    </Text>
  );
};

const RenderParagraphsCell = ({ cell }: CellRenderFunctionProps) => {
  const content = cell.getValue() as string | string[];
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

const RenderTagsCell = ({ cell }: CellRenderFunctionProps) => {
  const config = useContext(DiscoveryConfigContext);
  const content = cell.getValue() as any;
  return (
    <div>
      {content.map(({ name, category }: TagData) => {
        const color = getTagColor(category, config.tagCategories);
        return (
          <Badge
            key={name}
            role="button"
            tabIndex={0}
            className="discovery-header__tag-btn discovery-tag discovery-tag--selected"
            aria-label={name}
            style={{
              backgroundColor: color,
              borderColor: color,
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
  },
};

export const registerDiscoveryDefaultCellRenderers = () => {
  DiscoveryCellRendererFactory.registerCellRendererCatalog(
    Gen3DiscoveryStandardCellRenderers,
  );
};
