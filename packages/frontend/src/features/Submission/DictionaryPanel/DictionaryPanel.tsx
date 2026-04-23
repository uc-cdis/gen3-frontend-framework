import React, { useState, useEffect } from 'react';
import { useGetDictionaryQuery } from '@gen3/core';
import { Loader, Switch } from '@mantine/core';
import { removeUnusedFieldsFromDictionaryObject } from '../../Dictionary/utils';
import DictionaryProvider from '../../Dictionary/DictionaryProvider';
import { DataDictionary, DictionaryConfig } from '../../Dictionary';
import SubmissionForm from './SubmissionForm';

const DictionaryPanel = ({ config }: { config?: DictionaryConfig }) => {
  const [showFormSubmission, setShowFormSubmission] = useState(false);

  const toggleFormSubmission = () => setShowFormSubmission(!showFormSubmission);

  const { data, isLoading, isSuccess } = useGetDictionaryQuery();
  const [dictionary, setDictionary] = useState<DataDictionary>({});

  useEffect(() => {
    if (isSuccess) {
      const dictionary = removeUnusedFieldsFromDictionaryObject(
        data as unknown as Record<string, any>,
      );
      setDictionary(dictionary);
    }
  }, [data, isSuccess]);

  if (isLoading) {
    return <Loader />;
  }

  return config ? (
    <DictionaryProvider dictionary={dictionary} config={config}>
      <div className="flex flex-col gap-4 p-4 w-full h-screen">
        <button className="border-1 border-solid rounded-md border-primary text-primary p-2">
          {'Upload Structured TSV File'}
        </button>
        <Switch
          color="secondary"
          label="Use Form Submission"
          checked={showFormSubmission}
          onChange={toggleFormSubmission}
        />
        <hr className="mt-2" />
        {showFormSubmission ? <SubmissionForm dictionary={dictionary} /> : null}
      </div>
    </DictionaryProvider>
  ) : null;
};

export default DictionaryPanel;
