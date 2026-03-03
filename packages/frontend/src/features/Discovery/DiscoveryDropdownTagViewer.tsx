import { Button, Group, MultiSelect } from '@mantine/core';
import _ from 'lodash';
import { useState } from 'react';

// Transforms selected values from dropdown into format for proxy API
const transformSelectedValuesFormat = (
  input: selectedValues,
): Record<string, boolean> => {
  const result: Record<string, boolean> = {};
  for (const key in input) {
    input[key].forEach((value) => {
      result[value] = true;
    });
  }
  return result;
};

interface RenderMultiSelectOptionProps {
  option: { value: string };
}
interface selectedValues {
  [key: string]: string[];
}

const renderMultiSelectOption = (
  { option }: RenderMultiSelectOptionProps,
  highlightColor: string,
  selectedValues: selectedValues,
): JSX.Element => {
  const active = _.some(_.values(selectedValues), (array) =>
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
  setSelectedTags: Function;
}
const DiscoveryDropdownTagViewer = ({
  tagCategoryData,
  setSelectedTags,
}: DiscoveryDropdownTagViewerProps) => {
  if (!tagCategoryData || tagCategoryData?.length === 0) return null;
  const [selectedValues, setSelectedValues] = useState({} as selectedValues);

  const handleChange = (category: string, value: string[]) => {
    setSelectedValues((prev) => {
      const newSelectedValues = {
        ...prev,
        [category]: value,
      };
      setSelectedTags(transformSelectedValuesFormat(newSelectedValues));
      return newSelectedValues;
    });
  };

  return (
    <div>
      <Button onClick={() => setSelectedValues({})}>Reset</Button>
      <div
        className={`grid ${tagCategoryData.length > 1 ? 'grid-cols-2 gap-4' : 'grid-cols-1'}`}
      >
        {tagCategoryData.map((category) => (
          <div key={category.categoryDisplayName?.toString()}>
            <MultiSelect
              label={`Select tags for ${category.categoryDisplayName}`}
              placeholder="Pick values"
              value={selectedValues[category.categoryDisplayName] || []}
              onChange={(value) =>
                handleChange(category.categoryDisplayName, value)
              }
              clearable
              searchable
              data={category.tags.map((tag) => ({ value: tag, label: tag }))}
              renderOption={(option) =>
                renderMultiSelectOption(
                  option,
                  category.color as string,
                  selectedValues,
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
        ))}
      </div>
    </div>
  );
};

export default DiscoveryDropdownTagViewer;
