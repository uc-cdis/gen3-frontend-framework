import { useState } from 'react';
import { Button } from '@mantine/core';
import { CollapsableSidebar } from '../../../components/CollapsableSidebar';
import AdvancedSearch, { AdvancedSearchProps } from './AdvancedSearch';

const AdvancedSearchPanel = (props: AdvancedSearchProps) => {
  const [ opened, setOpened ] = useState(false);
  return (
    <div className="flex flex-col items-center p-2 m-2">
      <Button onClick={() => setOpened(!opened)} color="accent">Filters</Button>
      <CollapsableSidebar in={opened} >
        <AdvancedSearch {...props}  />
      </CollapsableSidebar>
    </div>
  );
};

export default AdvancedSearchPanel;
