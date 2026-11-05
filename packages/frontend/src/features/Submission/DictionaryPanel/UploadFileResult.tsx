import React from 'react';
import { VscError as ErrorIcon } from 'react-icons/vsc';
import { ROW_LIMIT } from '../utils';

interface UploadFileResultProps {
  file: File;
  parseError: boolean;
  uploadedDataLength: number;
  clearFile: () => void;
}

const compactNumFormatter = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  compactDisplay: 'short',
});

const UploadFileResult = ({
  file,
  parseError,
  uploadedDataLength,
  clearFile,
}: UploadFileResultProps) => {
  if (parseError) {
    return (
      <div className="border-1 p-2">
        <div className="flex items-center gap-2 text-utility-vivid">
          <ErrorIcon />
          <p>Invalid File Format</p>
        </div>
        <p>
          This file is not a valid structured TSV file. Please upload a TSV file
          that follows the required structure and column definition.
        </p>
      </div>
    );
  } else if (uploadedDataLength > ROW_LIMIT) {
    return (
      <div className="border-1 p-2">
        The file exceeds the limit of {compactNumFormatter.format(ROW_LIMIT)}{' '}
        rows.
      </div>
    );
  } else {
    return (
      <div className="border-1 p-2">
        <p className="font-bold break-words">{file?.name}</p>
        <p>File upload successfully. Review your data and submit.</p>
        <div className="flex gap-2 my-2">
          <button className="p-2 w-1/2 bg-primary text-white rounded-md">
            Submit
          </button>
          <button
            className="p-2 w-1/2 border-1 border-primary rounded-md"
            onClick={clearFile}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }
};

export default UploadFileResult;
