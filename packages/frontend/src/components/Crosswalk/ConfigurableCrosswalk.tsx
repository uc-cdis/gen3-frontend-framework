import React, { useState, useMemo } from 'react';
import { Crosswalk, CrosswalkProps } from './Crosswalk';
import { Select, Stack } from '@mantine/core';

interface LabeledCrosswalkProps extends CrosswalkProps {
  title: string;
}

interface ConfigurableCrosswalkProps {
  converters: Record<string, LabeledCrosswalkProps>;
}

const ConfigurableCrosswalk: React.FC<ConfigurableCrosswalkProps> = ({
  converters,
}: ConfigurableCrosswalkProps) => {
  const selectedData = useMemo(
    () =>
      Object.entries(converters).map(([key, value]) => {
        return { label: value.title, value: key, data: value };
      }),
    [converters],
  );
  const [selectedConverter, setSelectedConverter] = useState(
    selectedData[0].value,
  );
  const [converter, setConverter] = useState(Object.values(converters)[0]);

  const selectConverter = (s: string): void => {
    setSelectedConverter(s);
    setConverter(converters[s]);
  };



  return (
    <Stack>
      <div className='flex flex-row px-4'>
        <Select
          label='Select Converter'
          placeholder='Pick one'
          data={selectedData}
          value={selectedConverter}
          onChange={selectConverter}
        />
      </div>
      <Crosswalk {...converter}></Crosswalk>
    </Stack>
  );
};

export default ConfigurableCrosswalk;
