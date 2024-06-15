import React, {
  ReactElement,
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';
import { useScrollIntoView } from '@mantine/hooks';

import { MatchingSearchResult, ViewType } from './types';
import { getPropertyCount, SearchPathToPropertyIdString } from './utils';
import ViewSelector from './ViewSelector';
import TableSearch from './TableSearch';
import { useDictionaryContext } from './DictionaryProvider';
import CategoryPanel from './CategoryPanel';

const Dictionary = () => {
  const [selectedId, setSelectedId] = useState('');
  const [view, setView] = useState<ViewType>('table');
  const { dictionary, categories, visibleCategories, config } =
    useDictionaryContext();

  const scrollTo = useCallback((item: MatchingSearchResult) => {
    setSelectedId(() => SearchPathToPropertyIdString(item));
  }, []);

  return (
    <div className="flex m-2 bg-base-max">
      <div className="w-1/4 mr-4">
        {config?.showGraph ? (
          <ViewSelector view={view} setView={setView} />
        ) : null}
        <div className="p-4 text-sm">
          <span>
            The current commons dictionary has{' '}
            <span className="font-bold">{visibleCategories.length}</span> nodes
            and{' '}
            <span className="font-bold">
              {getPropertyCount(visibleCategories, dictionary)}
            </span>{' '}
            properties
          </span>
        </div>
        <TableSearch selectedId={selectedId} selectItem={scrollTo} />
      </div>
      <div className="w-3/4">
        {Object.keys(categories).length &&
          Object.keys(categories).map((category) => (
            <CategoryPanel
              key={category}
              category={category}
              selectedId={selectedId}
            />
          ))}
      </div>
    </div>
  );
};

export default React.memo(Dictionary);
