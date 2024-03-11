import { useState } from 'react';
import ResourcesFilters from './ResourcesFilters';
import ResourcesTable from './ResourcesTable';
import ResourcesProvider from './ResourcesProvider';


/**
 * TODO: not sure why ResourcesProvider component is needed when
 * ResourcesTable and ResourcesFilters get data from the useResourcesContext hook already
 * 
 */
export const ResourcesPanel = () => {
  const [filters, setFilters] = useState<string[]>([]);
  return (
    <div>
      <ResourcesProvider>
        <div className="flex">
          <ResourcesFilters setFilters={setFilters} selectedFilters={filters} />
          <ResourcesTable filters={filters} />
        </div>
      </ResourcesProvider>
    </div>
  );
};
