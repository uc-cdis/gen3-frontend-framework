import React, { useEffect, useState } from 'react';
import { useGetDictionaryQuery } from '@gen3/core';
import { Loader, Text } from '@mantine/core';
import Dictionary from './Dictionary';
import { DictionaryProps, DataDictionary } from './types';
import DictionaryProvider from './DictionaryProvider';
import { removeUnusedFieldsFromDictionaryObject } from './utils';
import dataDictionary from '../../pages/DataDictionary';

const DictionaryWithContext = ({ config }: DictionaryProps) => {
  const { data, isFetching, isUninitialized, isLoading, isError, isSuccess } =
    useGetDictionaryQuery();
  const [dictionary, setDictionary] = useState<DataDictionary>({});

  useEffect(() => {
    if (isSuccess) {
      const dictionary = removeUnusedFieldsFromDictionaryObject(
        data as unknown as Record<string, any>,
      );
      setDictionary(dictionary);
    }
  }, [data, isSuccess]);

  if (
    isLoading ||
    isFetching ||
    isUninitialized ||
    Object.keys(dictionary).length === 0
  ) {
    return (
      <div className="flex w-full py-24 relative justify-center">
        <Loader variant="dots" />{' '}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex w-full py-24 h-100 relative justify-center">
        <Text size={'xl'}>Error loading discovery data</Text>
      </div>
    );
  }

  return (
    <DictionaryProvider config={config} dictionary={dictionary}>
      <Dictionary />
    </DictionaryProvider>
  );
};

export default DictionaryWithContext;
