import { useState } from "react";
import ResourcesFilters from "./ResourcesFilters";
import ResourcesTable from "./ResourcesTable";
import ResourcesProvider from "./ResourcesProvider";


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
