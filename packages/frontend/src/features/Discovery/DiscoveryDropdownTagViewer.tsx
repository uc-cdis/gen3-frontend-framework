import { JSONObject } from '@gen3/core';
import { Button, ComboboxData, MultiSelect, TagsInput } from '@mantine/core';
import { useState } from 'react';

interface selectedValues {
  [key: string]: string[];
}

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

interface DiscoveryDropdownTagViewerProps {
  tagCategoryData: Array<JSONObject> | undefined;
  setSelectedTags: Function;
}

const DiscoveryDropdownTagViewer = ({
  tagCategoryData,
  setSelectedTags,
}: DiscoveryDropdownTagViewerProps) => {
  if (!tagCategoryData || tagCategoryData?.length === 0) return null;
  const [selectedValues, setSelectedValues] = useState({});

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
      <Button onClick={() => setSelectedValues([])}>Reset</Button>
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
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default DiscoveryDropdownTagViewer;
