import React, { useEffect, useRef } from 'react';
import igv from 'igv';

const GenomicIVG = () => {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current !== null) {
      const options = {
        showSampleNames: true,
        sampleNameViewportWidth: 200,
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
      console.log('createBrowser', igv, igv['createBrowser']);
      igv.createBrowser(ref.current, options);
    }
  }, []);

  return <div ref={ref} className="w-100 m-2"></div>;
};

export default GenomicIVG;
