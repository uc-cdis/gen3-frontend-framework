import React from 'react';
import { filesize } from 'filesize';
import { Icon } from '@iconify-icon/react';
import { CartSummary } from './types';

const CartSummaryPanel = ({ summary }: { summary: CartSummary }) => {
  return (
    <h1 className="uppercase flex 2xl:ml-auto items-center truncate text-xl">
      Total of{' '}
      <Icon
        icon="gen3:file"
        size={25}
        className="ml-2 mr-1"
        aria-hidden="true"
      />{' '}
      <b data-testid="text-file-count" className="mr-1">
        {summary?.totalFiles?.toLocaleString() || '--'}
      </b>{' '}
      {summary?.totalFiles === 1 ? 'File' : 'Files'}
      <span data-testid="text-size-count">
        {filesize(summary?.totalSize || 0)}
      </span>{' '}
    </h1>
  );
};

export default CartSummaryPanel;
