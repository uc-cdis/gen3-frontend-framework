import { JSONObject } from '@gen3/core';
import { Button, ComboboxData, MultiSelect, TagsInput } from '@mantine/core';
import { useState } from 'react';

const DiscoveryDropdownTagViewer = (
  tagCategoryData: Array<JSONObject> | undefined,
) => {
  if (
    !tagCategoryData.tagCategoryData ||
    tagCategoryData.tagCategoryData?.length === 0
  )
    return null;
  const [selectedValues, setSelectedValues] = useState({});

  const handleChange = (category, value) => {
    setSelectedValues((prev) => ({
      ...prev,
      [category]: value,
    }));
  };

  return (
    <div>
      <Button onClick={() => setSelectedValues([])}>Reset</Button>
      {tagCategoryData.tagCategoryData.map((category) => (
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
