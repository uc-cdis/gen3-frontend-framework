import React from 'react';
import { CollapsableSidebar } from '../../../components/CollapsableSidebar';
import AdvancedSearch, { AdvancedSearchProps } from './AdvancedSearch';

const AdvancedSearchPanel = (props: AdvancedSearchProps) => {
  const { opened } = props;
  return (
    <>
      <CollapsableSidebar in={opened} >
        <AdvancedSearch {...props}  />
      </CollapsableSidebar>
    </>
  );
};

export default AdvancedSearchPanel;
