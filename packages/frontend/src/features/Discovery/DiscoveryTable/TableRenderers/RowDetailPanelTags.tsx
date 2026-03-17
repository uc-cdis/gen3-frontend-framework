import React from 'react';
import { Badge } from '@mantine/core';
import { TagData } from '../../../Study';
import { getTagInfo } from '../../../Study/utils';
import { useDiscoveryContext } from '../../DiscoveryProvider';

interface RowDetailPanelProps {
  rowTags: TagData[];
}

const RowDetailPanelTags = ({ rowTags }: RowDetailPanelProps) => {
  rowTags as TagData[];
  const { discoveryConfig: config } = useDiscoveryContext();
  return (
    <div className="flex mt-2">
      {rowTags.map((tag: TagData) => {
        const { color, display, label } = getTagInfo(tag, config.tags);
        if (!display) return null;
        return (
          <Badge
            key={tag.name}
            className="mr-2 mt-2"
            onClick={(e) => {
              e.stopPropagation();
              alert(tag.name);
            }}
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

export default RowDetailPanelTags;
