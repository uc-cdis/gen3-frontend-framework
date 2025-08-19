import React from 'react';

interface GraphViewType {
  categories: string;
  selectedId: string;
}

const GraphView = ({
  categories,
  selectedId,
}: GraphViewType) => {

  console.log('GraphView categories', categories);
  console.log('GraphView selectedId', selectedId);
  return (
    <div className="mt-2">
      GraphView
    </div>
  );
};

export default GraphView;
