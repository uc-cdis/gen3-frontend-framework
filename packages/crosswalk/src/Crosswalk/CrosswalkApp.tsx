import React from 'react';
import ConfigurableCrosswalk from './ConfigurableCrosswalk';


const CrosswalkConfig = {
  N3C: {
    title: 'MIDRC to N3C',
    guidField: 'n3c_crosswalk',
    fromTitle: 'Enter your MIDRC Ids',
    toTitle: 'Matching N3C IDs',
    fromField: 'midrc_id',
    toField: 'n3c_id',
  },
  Petal: {
    title: 'BDCat to MIDRC',
    guidField: 'petal_crosswalk',
    fromTitle: 'Enter your BDCat Ids',
    toTitle: 'Matching MIDRC IDs',
    fromField: 'bdcat_id',
    toField: 'midrc_id',
  },
};

const CrosswalkApp  = () => {
  return (
    <ConfigurableCrosswalk converters={CrosswalkConfig } />
  );
};

export default CrosswalkApp;
