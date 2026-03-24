import React, { JSX } from 'react';
import { Group, MultiSelect } from '@mantine/core';
import _ from 'lodash';
import { useEffect, useState } from 'react';
import { categoryObject } from './types';

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
  selectedTags: { [key: string]: boolean };
  setSelectedTags: React.Dispatch<
    React.SetStateAction<{ [key: string]: boolean }>
  >;
}
const MultiSelectContainer = ({
  category,
  selectedTags,
  setSelectedTags,
}: MultiSelectContainerProps) => {
  const containerData = category.tags.map((tag) => ({
    value: tag,
    label: tag,
  }));
  const [containerSelections, setContainerSelections] = useState(
    [] as string[],
  );

  useEffect(() => {
    const updatedSelections = Object.keys(selectedTags).filter(
      (tag) => selectedTags[tag],
    );
    const selectedItemsThatExistInContainer = updatedSelections.filter((item) =>
      category.tags.includes(item),
    );
    setContainerSelections(selectedItemsThatExistInContainer);
  }, [selectedTags]);

  const [previousContainerValues, setPreviousContainerValues] = useState(
    [] as string[],
  );
  const handleChange = (category: string, value: string[]) => {
    setPreviousContainerValues(value);
    setSelectedTags((prevTags) => {
      // Create a copy of the previous tags
      const updatedTags = { ...prevTags };
      if (previousContainerValues.length > value.length) {
        // Need to remove tags since the update removes tags
        const valuesToBeRemoved = previousContainerValues.filter(
          (curr) => !value.includes(curr),
        );
        valuesToBeRemoved.forEach(
          (valueToBeRemoved) => delete updatedTags[valueToBeRemoved],
        );
      } else {
        // Need to add tags
        _.forEach(value, (tag) => {
          if (!updatedTags[tag]) {
            updatedTags[tag] = true;
          }
        });
      }
      return updatedTags; // Update state with the new tags
    });
  };
  return (
    <div key={category.categoryDisplayName?.toString()}>
      <MultiSelect
        placeholder={category.categoryDisplayName}
        value={containerSelections}
        onChange={(value) => handleChange(category.categoryDisplayName, value)}
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
  selectedTags: { [key: string]: boolean };
  setSelectedTags: React.Dispatch<
    React.SetStateAction<{ [key: string]: boolean }>
  >;
}

const DiscoveryDropdownTagViewer = ({
  tagCategoryData,
  selectedTags,
  setSelectedTags,
}: DiscoveryDropdownTagViewerProps) => {
  if (!tagCategoryData || tagCategoryData?.length === 0) return null;

  return (
    <div>
      <div
        className={`grid sm:grid-cols-1
          ${tagCategoryData.length > 1 && ' md:grid-cols-2 gap-4'}`}
      >
        {tagCategoryData.map((category, i) => (
          <div key={i}>
            <MultiSelectContainer
              category={category}
              selectedTags={selectedTags}
              setSelectedTags={setSelectedTags}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default DiscoveryDropdownTagViewer;
