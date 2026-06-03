import React, { useState, useEffect, useRef } from 'react';
import { useGetDictionaryQuery } from '@gen3/core';
import { Loader, Switch } from '@mantine/core';
import { removeUnusedFieldsFromDictionaryObject } from '../../Dictionary/utils';
import DictionaryProvider from '../../Dictionary/DictionaryProvider';
import { DataDictionary, DictionaryConfig } from '../../Dictionary';
import MessagePanel from '../../../components/MessagePanel';
import SubmissionForm from './SubmissionForm';
import UploadFileResult from './UploadFileResult';

interface DictionaryPanelProps {
  readonly config?: DictionaryConfig;
  readonly file: File | undefined;
  readonly setFile: (file: File | undefined) => void;
  readonly uploadedDataLength: number;
  readonly parseError: boolean;
}

const DictionaryPanel = ({
  config,
  file,
  setFile,
  uploadedDataLength,
  parseError,
}: DictionaryPanelProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showFormSubmission, setShowFormSubmission] = useState(false);

  const toggleFormSubmission = () => setShowFormSubmission(!showFormSubmission);

  const { data, isLoading, isSuccess } = useGetDictionaryQuery();
  const [dictionary, setDictionary] = useState<DataDictionary>({});

  useEffect(() => {
    if (isSuccess) {
      const dictionary = removeUnusedFieldsFromDictionaryObject(data);
      setDictionary(dictionary);
    }
  }, [data, isSuccess]);

  const handleFileChange = async () => {
    if (fileInputRef?.current?.files?.length === 1) {
      const file = fileInputRef?.current?.files[0];
      setFile(file);
    }
  };

  const clearFile = () => {
    setFile(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  return config ? (
    <DictionaryProvider dictionary={dictionary} config={config}>
      <div className="flex flex-col gap-4 p-4 w-full h-screen">
        <button
          className="border-1 border-solid rounded-md border-primary text-primary p-2"
          onClick={() => fileInputRef?.current?.click()}
        >
          {'Upload Structured TSV File'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
          accept=".tsv"
        />
        {file === undefined ? null : (
          <UploadFileResult
            file={file}
            clearFile={clearFile}
            parseError={parseError}
            uploadedDataLength={uploadedDataLength}
          />
        )}
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
  ) : (
    <MessagePanel message="Dictionary config is not defined. Page disabled" />
  );
};

export default DictionaryPanel;
