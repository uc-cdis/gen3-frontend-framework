import { useState } from 'react';
import ResourcesFilters from './ResourcesFilters';
import ResourcesTable from './ResourcesTable';
import ResourcesProvider from './ResourcesProvider';

/**
 * ResourcesPanel gets filters from ResourcesFilters panel and passes those
 * filters into useState setFilters hook to be used as the filters variable in the
 * ResourcesTable on the profile page
 */
export const ResourcesPanel = () => {
  const [filters, setFilters] = useState<string[]>([]);
  console.log("resourcesPanel filters", filters);
  return (
    <ResourcesProvider>
      <div className="flex">
        <ResourcesFilters setFilters={setFilters} selectedFilters={filters} />
        <ResourcesTable filters={filters} />
      </div>
    </ResourcesProvider>
  );
};
