import React from 'react';
import { PersonIcon, SaveIcon } from '../../../types/icons';
import { filesize } from 'filesize';

interface FileStatsProps {
  totalCaseCount: number;
  totalFileSize: number;
  totalFileCount: number;
  isFetching: boolean;
}

const Stats = ({
  totalCaseCount,
  totalFileSize,
  totalFileCount,
  isFetching,
}: FileStatsProps) => (
  <div className="flex gap-1 text-xl items-center uppercase flex-wrap">
    <div>
      Total of{' '}
      <strong>{!isFetching ? totalFileCount.toLocaleString() : '--'}</strong>{' '}
      {totalFileCount !== 1 ? 'Files' : 'File'}
    </div>
    <div>
      <PersonIcon className="ml-2 mr-1 mb-1 inline-block" aria-hidden="true" />
      <strong className="mr-1">{totalCaseCount}</strong>
      {totalCaseCount !== 1 ? 'Cases' : 'Case'}
    </div>
    <div>
      <SaveIcon className="ml-2 mr-1 mb-1 inline-block" aria-hidden="true" />
      {filesize(totalFileSize)}
    </div>
  </div>
);

export default Stats;
