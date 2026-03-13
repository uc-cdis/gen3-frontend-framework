import { useEffect } from 'react';
import {
  useLazyGetIndexdMetdataQuery,
  useLazyGetIndexObjectQuery,
} from '@gen3/core';

export const useGetBAMAndBAIFileFromGUID = (bamId: string) => {
  const [
    fetchBAMData,
    {
      data: bamMetadata,
      error: bamMetadataError,
      isFetching: isFetchingBamMetadata,
      isSuccess: isSuccessBamMetadata,
      isError: isErrorBamMetadata,
    },
  ] = useLazyGetIndexObjectQuery();

  const [
    fetchBAIMetadata,
    {
      data: baiMetadata,
      error: baiMetadataError,
      isFetching: isFetchingBaiMetadata,
      isSuccess: isSuccessBaiMetadata,
      isError: isErrorBaiMetadata,
    },
  ] = useLazyGetIndexdMetdataQuery();

  useEffect(() => {
    if (!bamId) return;

    fetchBAMData(bamId);
  }, [bamId, fetchBAMData]);

  useEffect(() => {
    if (!isSuccessBamMetadata || !bamMetadata?.file_name) return;

    const baiFilename = bamMetadata.file_name.replace('.bam', '.bai');

    fetchBAIMetadata({
      filters: [{ key: 'file_name', value: baiFilename }],
    });
  }, [isSuccessBamMetadata, bamMetadata, fetchBAIMetadata]);

  const isFetching = isFetchingBamMetadata || isFetchingBaiMetadata;
  const isError = isErrorBamMetadata || isErrorBaiMetadata;
  const isSuccess = isSuccessBamMetadata && isSuccessBaiMetadata;

  return {
    bamMetadata: isSuccess ? bamMetadata : undefined,
    baiMetadata: isSuccess ? baiMetadata : undefined,
    isFetching,
    isError,
    isSuccess,
    error: bamMetadataError ?? baiMetadataError,
  };
};
