import React from 'react';
import { Badge } from '@mantine/core';
import { TagData } from '../../../Study';
import { getTagInfo } from '../../../Study/utils';
import { useDiscoveryContext } from '../../DiscoveryProvider';

interface RowDetailPanelProps {
  rowTags: TagData[];
}

const RowDetailPanelTags = ({ rowTags }: RowDetailPanelProps) => {
  const {
    discoveryConfig: config,
    selectedTags,
    setSelectedTags,
  } = useDiscoveryContext();
  return (
    <div className="flex mt-2">
      {rowTags?.map((tag: TagData) => {
        const { color, display, label } = getTagInfo(tag, config.tags);
        if (!display) return null;
        const active = Object.keys(selectedTags).includes(tag.name);

        const handleChange = (
          e: React.MouseEvent<HTMLDivElement, MouseEvent>,
        ) => {
          e.stopPropagation();
          if (active) {
            // If already active, remove the tag
            setSelectedTags((prevTags) => {
              const { [tag.name]: _, ...newTags } = prevTags;
              return newTags;
            });
          } else {
            // Otherwise add the tag
            setSelectedTags((prevObj) => ({
              ...prevObj,
              [tag.name]: true,
            }));
          }
        };
        return (
          <Badge
            key={tag.name}
            className="mr-2 mt-2 cursor-pointer"
            onClick={(e) => {
              handleChange(e);
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
