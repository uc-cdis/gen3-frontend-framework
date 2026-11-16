import React from 'react';
import { CollapsableSidebar } from '../../../components/CollapsableSidebar';
import AdvancedSearch, { AdvancedSearchProps } from './AdvancedSearch';

const AdvancedSearchPanel = (props: AdvancedSearchProps) => {
  const { opened } = props;
  return (
    <React.Fragment>
      <CollapsableSidebar expanded={opened} className="max-w-60 pr-2">
        <AdvancedSearch {...props} />
      </CollapsableSidebar>
    </React.Fragment>
  );
};

export default AdvancedSearchPanel;
