import React, { useMemo, useState } from 'react';
import { Button, Group, ComboboxItem, Select } from '@mantine/core';
import { useDataLibrary } from '@gen3/core';
import { useAnalysisTools } from '../../../lib/common/analysisToolFramework';

const extractListNameAndId = (data: any): ComboboxItem[] =>
  Object.keys(data).map((id) => ({ value: id, label: data[id].name }));

const AddToDataLibrary = () => {
  const { useDataLibraryServiceAPI } = useAnalysisTools();
  const { isLoading, isError, dataLibrary } = useDataLibrary(
    useDataLibraryServiceAPI ?? false,
  );

  const [value, setValue] = useState<ComboboxItem | null>(null);

  const datasets = useMemo(() => {
    if (isLoading || isError) return [];
    return extractListNameAndId(dataLibrary);
  }, [dataLibrary, isError, isLoading]);

  console.log('datasets: ', datasets);
  return (
    <Group>
      <Select
        data={datasets}
        value={value ? value.value : null}
        onChange={(_value, option) => setValue(option)}
      />
      <Button>+</Button>
      <Button disabled={value === null}>Add To List</Button>
    </Group>
  );
};

export default AddToDataLibrary;
