import React from 'react';
import Link from 'next/link';
import { Loader } from '@mantine/core';
import { useGetIndexdMetdataQuery, useUserAuth } from '@gen3/core';
import { TbFileUpload as UploadIcon } from 'react-icons/tb';
import MessagePanel from '../../components/MessagePanel';
import { ProtectedContent } from '../../components/Protected';
import BackLink from './BackLink';
import type { SubmissionConfig } from './types';

const UploadedFiles = ({ config }: { config?: SubmissionConfig }) => {
  const { data: userData, isFetching: authFetching } = useUserAuth();

  const { data, isSuccess, isLoading } = useGetIndexdMetdataQuery(
    { filters: [], params: { uploader: userData?.email } },
    { skip: authFetching },
  );

  return (
    <div className="w-full">
      <ProtectedContent>
        {config ? (
          <>
            <div className="p-4 w-full border-b-1">
              <BackLink currentPage="My Files" />
            </div>
            <div className="p-2">
              {isLoading ? (
                <Loader />
              ) : (
                isSuccess &&
                data?.records.length === 0 && (
                  <div className="flex flex-col h-screen items-center">
                    <div className="bg-white p-2 mt-4 border-1 rounded">
                      <UploadIcon size="4rem" className="text-primary-darker" />
                    </div>
                    <h2 className="text-xl font-bold m-4">
                      No files have been uploaded
                    </h2>
                    <p>
                      Only files uploaded with the Gen3 client are unmapped.
                      There are no unmapped files here.
                    </p>
                    <p>
                      Follow the{' '}
                      <a
                        href={config.docLinkLocation}
                        target="_blank"
                        rel="noreferrer"
                        className="text-utility-link underline"
                      >
                        {config.docLinkText}
                      </a>{' '}
                      to set up and upload your files.
                    </p>
                    <Link
                      href="/Submission"
                      className="p-2 mt-4 bg-white text-primary-darker border-1 border-primary-darker rounded"
                    >
                      Back to Submission
                    </Link>
                  </div>
                )
              )}
            </div>
          </>
        ) : (
          <MessagePanel message="Submission config is not defined. Page disabled" />
        )}
      </ProtectedContent>
    </div>
  );
};

export default UploadedFiles;
