import React, { useCallback, useState } from 'react';
import { MatchingSearchResult, ViewType } from './types';
import { getPropertyCount, SearchPathToPropertyIdString } from './utils';
import ViewSelector from './ViewSelector';
import TableSearch from './TableSearch';
import { useDictionaryContext } from './DictionaryProvider';
import CategoryPanel from './CategoryPanel';
import { useScrollIntoView } from '@mantine/hooks';

const Dictionary = () => {
  const [selectedId, setSelectedId] = useState('');
  const [view, setView] = useState<ViewType>('table');
  const { dictionary, categories, visibleCategories, config } =
    useDictionaryContext();

  const { scrollIntoView, targetRef, scrollableRef } =
    useScrollIntoView<HTMLSpanElement, HTMLDivElement>({
      offset: 60,
    });

  const scrollTo = useCallback((item: MatchingSearchResult) => {
    setSelectedId(() => SearchPathToPropertyIdString(item));
  }, []);

  const scrollToSelection = useCallback(
    (itemRef: HTMLSpanElement) => {
      // @ts-expect-error need to refactor this
      targetRef.current = itemRef;
      scrollIntoView();
    },
    [scrollIntoView, targetRef],
  );

  return (
    <>
      <div className="w-1/4 overflow-auto p-4">
        <div className="h-full">
          {config?.showGraph ? (
            <ViewSelector view={view} setView={setView} />
          ) : null}
          <span>
            The current commons dictionary has{' '}
            <span className="font-bold">{visibleCategories.length}</span> nodes
            and{' '}
            <span className="font-bold">
              {getPropertyCount(visibleCategories, dictionary)}
            </span>{' '}
            properties
          </span>
          <TableSearch selectItem={scrollTo} />
        </div>
      </div>
      <div
        className="w-3/4 overflow-auto p-4 bg-base-lighter"
        ref={scrollableRef}
      >
        <div className="h-full">
          {Object.keys(categories).length &&
            Object.keys(categories).map((category) => (
              <CategoryPanel
                key={category}
                category={category}
                selectedId={selectedId}
                scrollToSelection={scrollToSelection}
              />
            ))}
        </div>
      </div>
    </>
  );
};

export default React.memo(Dictionary);
