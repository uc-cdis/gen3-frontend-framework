import React from 'react';
import { Badge } from '@mantine/core';
import { TagData } from '../../../Study';
import { getTagInfo } from '../../../Study/utils';
import { useDiscoveryContext } from '../../DiscoveryProvider';
import { OnChangeFn } from '@tanstack/table-core';

interface RowDetailPanelProps {
  rowTags: TagData[];
  selectedTags: { [key: string]: boolean };
  setSelectedTags: OnChangeFn<{ [key: string]: boolean }>;
}

const RowDetailPanelTags = ({
  rowTags,
  selectedTags,
  setSelectedTags,
}: RowDetailPanelProps) => {
  rowTags as TagData[];
  const { discoveryConfig: config } = useDiscoveryContext();
  return (
    <div className="flex mt-2">
      {rowTags.map((tag: TagData) => {
        const { color, display, label } = getTagInfo(tag, config.tags);
        const active = Object.keys(selectedTags).includes(tag.name);
        if (!display) return null;
        return (
          <Badge
            key={tag.name}
            className="mr-2 mt-2 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              if (active) {
                setSelectedTags((prevTags) => {
                  const { [tag.name]: _, ...newTags } = prevTags;
                  return newTags;
                });
              } else {
                setSelectedTags((prevObj) => ({
                  ...prevObj,
                  [tag.name]: true,
                }));
              }
            }}
            role="button"
            size="lg"
            radius="sm"
            variant="filled"
            tabIndex={0}
            aria-label={tag.name}
            style={{
              backgroundColor: active ? color : 'transparent',
              borderColor: color,
              color: active ? '#fff' : 'inherit',
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
