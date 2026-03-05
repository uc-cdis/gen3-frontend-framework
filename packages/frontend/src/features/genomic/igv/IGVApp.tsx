import React from 'react';
import { useGetDownloadQuery } from '@gen3/core';
import { Button, Loader, Stack } from '@mantine/core';
import { useRouter } from 'next/dist/client/router';
import { IgvBrowserConfiguration } from './types';
import IGVBrowser from './IGVBrowser';
import { NextRouter } from 'next/router';

const getBamFileURL = (router: NextRouter): string => {
  const { bam } = router.query;
  if (typeof bam === 'string') return bam;
  else if (typeof bam === 'object') return bam[0];

  return 'notFound';
};

const IGVApp = (configuration: IgvBrowserConfiguration) => {
  const router = useRouter();
  const bamId = getBamFileURL(router);

  const { data, isFetching, isSuccess, isError } = useGetDownloadQuery(bamId);
  if (isError) return <div className="w-full m-10">Error fetching data</div>;
  if (isFetching)
    return (
      <div className="w-full m-10">
        <Loader />
      </div>
    );
  if (isSuccess && data)
    return (
      <div className="w-full m-10">
        <Stack>
          <Button
            variant="contained"
            color="primary"
            onClick={() => router.push('/Explorer')}
          >
            Return to Explorer
          </Button>
          <IGVBrowser
            bamUrl={data.url}
            genome={configuration.genome}
            locus={configuration.locus}
            track={configuration.track}
            showDefaultTracks={configuration.showDefaultTracks}
          />
        </Stack>
      </div>
    );

  return null;
};

export default IGVApp;
