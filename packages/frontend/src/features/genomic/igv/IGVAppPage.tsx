import { IgvBrowserConfiguration } from './types';
import { useGetBAMAndBAIFileFromGUID } from './hooks';
import { Loader } from '@mantine/core';
import IGVBrowser from './IGVBrowser';
import React from 'react';

interface IGVAppPageProps {
  bamId: string;
  configuration: IgvBrowserConfiguration;
}

const IGVAppPage = ({ bamId, configuration }: IGVAppPageProps) => {
  const { bamUrl, baiUrl, isFetching, isSuccess, isError } =
    useGetBAMAndBAIFileFromGUID(bamId);

  if (isError) return <div className="w-full m-10">Error fetching data</div>;
  if (isFetching)
    return (
      <div className="w-full m-10">
        <Loader />
      </div>
    );
  if (isSuccess && bamUrl && baiUrl)
    return (
      <IGVBrowser
        bamUrl={bamUrl.url}
        baiUrl={baiUrl.url}
        genome={configuration.genome}
        locus={configuration.locus}
        track={configuration.track}
        showDefaultTracks={configuration.showDefaultTracks}
      />
    );

  return null;
};

export default IGVAppPage;
