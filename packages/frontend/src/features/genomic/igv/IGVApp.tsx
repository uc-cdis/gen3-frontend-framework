import React from 'react';
import { Button, Group, Loader, Stack } from '@mantine/core';
import { useRouter } from 'next/dist/client/router';
import { IgvBrowserConfiguration } from './types';
import { NextRouter } from 'next/router';
import { useGetBAMAndBAIFileFromGUID } from './hooks';
import IGVBrowser from './IGVBrowser';

const getBamFileURL = (router: NextRouter): string => {
  const { bam } = router.query;
  if (typeof bam === 'string') return bam;
  else if (typeof bam === 'object') return bam[0];

  return 'notFound';
};

const IGVApp = (configuration: IgvBrowserConfiguration) => {
  const router = useRouter();
  const bamId = getBamFileURL(router);

  const { bamUrl, baiUrl, isFetching, isSuccess, isError } =
    useGetBAMAndBAIFileFromGUID(bamId);

  console.log('bamMetadata', bamUrl, baiUrl);

  //const { data, isFetching, isSuccess, isError } = useGetDownloadQuery(bamId);
  if (isError) return <div className="w-full m-10">Error fetching data</div>;
  if (isFetching)
    return (
      <div className="w-full m-10">
        <Loader />
      </div>
    );
  if (isSuccess && bamUrl && baiUrl)
    return (
      <div className="w-full m-10">
        <Stack>
          <Group justify="flex-start">
            <Button
              variant="contained"
              color="primary"
              onClick={() =>
                router.push(
                  `${configuration?.returnTab ? '/Explorer?activeTab=' + configuration?.returnTab : '/Explorer'}`,
                )
              }
            >
              Return To Data Files
            </Button>
          </Group>

          <IGVBrowser
            bamUrl={bamUrl.url}
            baiUrl={baiUrl.url}
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
