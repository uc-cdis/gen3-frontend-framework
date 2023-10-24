import ResourcesFilters from './ResourcesFilters';
import ResourcesTable from './ResourcesTable';
import ResourcesProvider from './ResourcesProvider';

export const ResourcesPanel = () => {
  return (
    <div>
      <ResourcesProvider>
        <div className="flex">
          <ResourcesFilters />
          <ResourcesTable />
        </div>
      </ResourcesProvider>
    </div>
  );
};
