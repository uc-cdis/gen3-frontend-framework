import React from 'react';
import { getTagInfo } from '../utils';
import { TagData } from '../types';
import { CellRendererFunction, CellRenderFunctionProps } from './types';
import { Badge } from '@mantine/core';

// TODO Fix below
// eslint-disable-next-line react/prop-types
export const RenderTagsCell: CellRendererFunction = ({
  value,
}: CellRenderFunctionProps) => {
  const content = value as TagData[];
  return (
    <div className="flex space-x-1 space-y-4">
      {content.map((x: TagData) => {
        const { color, display, label } = getTagInfo(x);
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
