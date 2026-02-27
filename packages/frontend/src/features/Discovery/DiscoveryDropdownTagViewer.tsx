import { JSONObject } from '@gen3/core';
import { Button, ComboboxData, MultiSelect, TagsInput } from '@mantine/core';
import { useState } from 'react';

interface selectedValues {
  [key: string]: string[];
}

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

  const handleChange = (category, value) => {
    setSelectedTags(transformSelectedValuesFormat(selectedValues));
    setSelectedValues((prev) => ({
      ...prev,
      [category]: value,
    }));
    console.log('selectedValues', selectedValues);
    // setSelectedTags({ 'BioSystics-AP': true });
  };

  return (
    <div>
      <Button onClick={() => setSelectedValues([])}>Reset</Button>
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
            data={category.tags.map((tag) => ({ value: tag, label: tag }))} // Format to { value, label }
          />
        </div>
      ))}
    </div>
  );
};

export default DiscoveryDropdownTagViewer;
