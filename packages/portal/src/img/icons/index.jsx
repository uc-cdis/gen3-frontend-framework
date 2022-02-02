import React from 'react';
import IcoBarChart from './bar-chart.min.svg';
import IcoGen3 from './gen3.min.svg';
import IcoProfile from './profile.min.svg';
import IcoQuery from './query.min.svg';
import IcoWorkspace from './workspace.min.svg';

const dictIcons = {
  'bar-chart': (height, customedStyles) => (
    <IcoBarChart height={height} style={{ ...customedStyles }} />
  ),
  gen3: (height, customedStyles) => (
    <IcoGen3
      height={height}
      style={{ ...customedStyles }}
    />
  ),
  profile: (height, customedStyles) => (
    <IcoProfile height={height} style={{ ...customedStyles }} />
  ),
  query: (height, customedStyles) => (
    <IcoQuery height={height} style={{ ...customedStyles }} />
  ),
  workspace: (height, customedStyles) => (
    <IcoWorkspace height={height} style={{ ...customedStyles }} />
  ),
  // uchicago: (height, customedStyles) => (
  //   <IcoSignature
  //     height={height}
  //     style={{ ...customedStyles }}
  //   />
  // ),
};

export default dictIcons;
