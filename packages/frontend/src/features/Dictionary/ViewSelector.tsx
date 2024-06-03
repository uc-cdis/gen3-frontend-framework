import React from 'react';
import { ViewType } from './types';

const SelectedStyle = (selected: boolean): string => {
  return `${
    selected
      ? 'bg-primary text-primary-contrast'
      : 'bg-base-max text-base-contrast-max'
  } text-md py-2 px-10 first:rounded-tl-md first:rounded-bl-md last:rounded-tr-md last:rounded-br-md border-2 border-primary`;
};

interface ViewSelectorProps {
  view: ViewType;
  setView: (_: ViewType) => void;
}
const ViewSelector = ({ view, setView }: ViewSelectorProps) => {
  return (
    <div className="flex justify-center border-b-2 border-0 border-base-light py-10">
      <button
        className={SelectedStyle(view === 'table')}
        onClick={() => setView('table')}
      >
        Table View
      </button>
      <button
        className={SelectedStyle(view === 'graph')}
        onClick={() => setView('graph')}
      >
        Graph View
      </button>
    </div>
  );
};

export default ViewSelector;
