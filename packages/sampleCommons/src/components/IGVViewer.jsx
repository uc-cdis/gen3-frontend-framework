'use_client';
import React, { useEffect, useRef, useState } from 'react';
import igv from 'igv';

const IGVViewer = () => {
  const igvContainer = useRef(null);

  const [igvInstance, setIgvInstance] = useState(null);

  useEffect(() => {
    const loadIGV = async () => {
      if (!igvContainer.current) return;

      console.log('waiting on impoprt');
      try {
        const igvModule = await import('igv');
        setIgvInstance(igvModule.default);
        console.log(
          'done on impoprt',
          igvModule,
          igvModule.index,
          igvModule.createBrowser,
        );
      } catch (error) {
        console.error('Failed to load IGV:', error);
      }
    };

    loadIGV();
  }, []);

  useEffect(() => {
    if (!igvInstance || !igvContainer.current) return;

    const options = {
      genome: 'hg38',
      tracks: [
        {
          format: 'maf',
          type: 'mut',
          url: 'https://s3.amazonaws.com/igv.org.demo/TCGA.BRCA.mutect.995c0111-d90b-4140-bee7-3845436c3b42.DR-10.0.somatic.maf.gz',
          height: 700,
          displayMode: 'EXPANDED',
        },
      ],
    };

    let browser;

    igvInstance
      .createBrowser(igvContainer.current, options)
      .then((createdBrowsery) => {
        console.log('IGV browser created');
        browser = createdBrowser;
      })
      .catch((error) => {
        console.error('Error creating IGV browser:', error);
      });

    return () => {
      if (browser) {
        browser.destroy();
      }
    };
  }, [igvInstance]);

  return (
    <div className="w-full h-[600px]" ref={igvContainer}>
      {!igvInstance && <p>Loading IGV...</p>}
    </div>
  );
};

export default IGVViewer;
