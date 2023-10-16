import React from 'react';
import { CollapsableSidebar } from '../../../components/CollapsableSidebar';
import AdvancedSearch, { AdvancedSearchProps } from './AdvancedSearch';

const AdvancedSearchPanel = (props: AdvancedSearchProps) => {
  const { opened } = props;
  return (
    <React.Fragment>
      <CollapsableSidebar in={opened}>
        <AdvancedSearch {...props} />
      </CollapsableSidebar>
    </React.Fragment>
  );
};

export default AdvancedSearchPanel;
