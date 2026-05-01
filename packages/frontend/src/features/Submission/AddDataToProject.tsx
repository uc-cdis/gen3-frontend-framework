import React from 'react';
import DictionaryPanel from './DictionaryPanel/DictionaryPanel';
import { DictionaryConfig } from '../Dictionary';

const AddDataToProject = ({ config }: { config?: DictionaryConfig }) => (
  <div className="w-full flex">
    <div className="bg-white w-1/3">
      <DictionaryPanel config={config} />
    </div>
    <div className="p-2">{'Graph not implemented yet'}</div>
  </div>
);

export default AddDataToProject;
