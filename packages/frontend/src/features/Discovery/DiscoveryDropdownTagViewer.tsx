import React, { JSX, useEffect, useRef, useState } from 'react';
import { Group, MultiSelect } from '@mantine/core';
import { categoryObject } from './types';
import { useDiscoveryContext } from './DiscoveryProvider';

interface RenderMultiSelectOptionProps {
  option: { value: string };
}

const renderMultiSelectOption = (
  { option }: RenderMultiSelectOptionProps,
  highlightColor: string,
  containerSelections: string[],
): JSX.Element => {
  const active = containerSelections.includes(option.value);
  return (
    <Group gap="sm">
      <div
        style={{
          border: '2px solid' + highlightColor,
          background: active ? highlightColor : 'transparent',
          color: active ? '#fff' : 'inherit',
          borderRadius: '5px',
          padding: '0 10px',
        }}
      >
        {option.value}
      </div>
    </Group>
  );
};

interface MultiSelectContainerProps {
  category: categoryObject;
}
const MultiSelectContainer = ({ category }: MultiSelectContainerProps) => {
  const {
    discoveryConfig: discoveryConfig,
    selectedTags,
    setSelectedTags,
  } = useDiscoveryContext();

  const containerData = category.tags.map((tag) => ({
    value: tag,
    label: tag,
  }));
  const [containerSelections, setContainerSelections] = useState(
    [] as string[],
  );
  const prevSelectionsRef = useRef<string[]>([]);
  useEffect(() => {
    const updatedSelections = Object.keys(selectedTags).filter(
      (tag) => selectedTags[tag],
    );
    const selectedItemsThatExistInContainer = updatedSelections.filter((item) =>
      category.tags.includes(item),
    );
    setContainerSelections(selectedItemsThatExistInContainer);
    prevSelectionsRef.current = selectedItemsThatExistInContainer;
  }, [selectedTags]);

  const handleChange = (value: string[]) => {
    const previousValues = prevSelectionsRef.current;
    const removedTags = previousValues.filter(
      (tag: string) => !value.includes(tag),
    );
    const addedTags = value.filter((tag) => !previousValues.includes(tag));
    setSelectedTags((prev) => {
      const updated = { ...prev };
      removedTags.forEach((tag) => delete updated[tag]);
      addedTags.forEach((tag) => {
        updated[tag] = true;
      });
      return updated;
    });
    setContainerSelections(value);
    prevSelectionsRef.current = value;
  };

  return (
    <div key={category.categoryDisplayName?.toString()}>
      <MultiSelect
        placeholder={category.categoryDisplayName}
        value={containerSelections}
        onChange={(value) => handleChange(value)}
        clearable
        searchable
        data={containerData}
        renderOption={(option) =>
          renderMultiSelectOption(
            option,
            category.color as string,
            containerSelections,
          )
        }
        styles={{
          pill: {
            backgroundColor: category.color as string,
            color: '#fff',
          },
        }}
      />
    </div>
  );
};

interface DiscoveryDropdownTagViewerProps {
  tagCategoryData: Array<categoryObject> | undefined;
}

const DiscoveryDropdownTagViewer = ({
  tagCategoryData,
}: DiscoveryDropdownTagViewerProps) => {
  if (!tagCategoryData || tagCategoryData?.length === 0) return null;

  return (
    <div
      className={`grid sm:grid-cols-1
          ${tagCategoryData.length > 1 && ' md:grid-cols-2 gap-4'}`}
    >
      {tagCategoryData.map((category, i) => (
        <div key={i}>
          <MultiSelectContainer category={category} />
        </div>
      ))}
    </div>
  );
};

export default DiscoveryDropdownTagViewer;
