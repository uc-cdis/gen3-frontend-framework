import React from 'react';
import { getTagInfo } from '../utils';
import { TagData } from '../types';
import { CellRendererFunction, CellRenderFunctionProps } from './types';
import { Badge } from '@mantine/core';
import { useDiscoveryContext } from '../../Discovery';

export const RenderTagsCell: CellRendererFunction = ({
  value,
}: CellRenderFunctionProps) => {
  const { discoveryConfig: config } = useDiscoveryContext();
  const content = value as TagData[];
  return (
    <div className="flex space-x-1 ">
      {content.map((tag: TagData) => {
        const { color, display, label } = getTagInfo(tag, config.tags);
        if (!display) return null;
        return (
          <Badge
            key={tag.name}
            role="button"
            size="lg"
            radius="sm"
            variant="filled"
            tabIndex={0}
            aria-label={tag.name}
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
