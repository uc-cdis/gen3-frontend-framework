import type { ReactElement, ReactNode } from 'react';

interface ModelsGridProps {
  children: ReactNode;
}

export const ModelsGrid = ({ children }: ModelsGridProps): ReactElement => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
    {children}
  </div>
);

export default ModelsGrid;
