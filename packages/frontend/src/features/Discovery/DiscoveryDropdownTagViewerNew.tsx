import { Button, Group, MultiSelect } from '@mantine/core';
import _ from 'lodash';
import { useEffect, useState } from 'react';

interface RenderMultiSelectOptionProps {
  option: { value: string };
}
interface selectedValues {
  [key: string]: string[];
}

const renderMultiSelectOption = (
  { option }: RenderMultiSelectOptionProps,
  highlightColor: string,
  containerSelections: any,
): JSX.Element => {
  const active = _.some(_.values(containerSelections), (array) =>
    _.includes(array, option.value),
  );
  return (
    <Group gap="sm">
      <div
        style={{
          border: '2px solid' + highlightColor,
          background: active ? highlightColor : 'inherit',
          color: active ? 'white' : 'inherit',
          borderRadius: '5px',
          padding: '0 10px',
        }}
      >
        {option.value}
      </div>
    </Group>
  );
};

interface categoryObjects {
  categoryDisplayName: string;
  tags: string[];
  color: string;
}
interface DiscoveryDropdownTagViewerProps {
  tagCategoryData: Array<categoryObjects> | undefined;
  selectedTags: any;
  setSelectedTags: Function;
}

const MultiSelectContainer = ({ category, selectedTags, setSelectedTags }) => {
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
    console.log('updatedSelections', updatedSelections);
    const selectedItemsThatExistInContainer = updatedSelections.filter((item) =>
      category.tags.includes(item),
    );
    setContainerSelections(selectedItemsThatExistInContainer);
  }, [selectedTags]);

  const handleChange = (category: string, value: string[]) => {
    setSelectedTags((prevTags) => {
      // Create a copy of the previous tags
      const updatedTags = { ...prevTags };
      // Check if the tag exists and toggle it
      if (updatedTags[value.at(-1)]) {
        delete updatedTags[value.at(-1)]; // Remove the tag if it exists
      } else {
        updatedTags[value.at(-1)] = true; // Add the tag if it doesn't exist
      }
      return updatedTags; // Update state with the new tags
    });
  };
  return (
    <div key={category.categoryDisplayName?.toString()}>
      containerSelections:{JSON.stringify(containerSelections)}
      <MultiSelect
        label={`Select tags for ${category.categoryDisplayName}`}
        placeholder="Pick values"
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
            color: 'white',
          },
        }}
      />
    </div>
  );
};

const DiscoveryDropdownTagViewerNew = ({
  tagCategoryData,
  selectedTags,
  setSelectedTags,
}: DiscoveryDropdownTagViewerProps) => {
  if (!tagCategoryData || tagCategoryData?.length === 0) return null;

  return (
    <div>
      <div
        className={`grid ${tagCategoryData.length > 1 ? 'grid-cols-2 gap-4' : 'grid-cols-1'}`}
      >
        {tagCategoryData.map((category) => (
          <MultiSelectContainer
            category={category}
            selectedTags={selectedTags}
            setSelectedTags={setSelectedTags}
          />
        ))}
      </div>
    </div>
  );
};

export default DiscoveryDropdownTagViewerNew;
