import React, { MutableRefObject, useCallback, useState } from 'react';
import { MatchingSearchResult, ViewType } from './types';
import { getPropertyCount, SearchPathToPropertyIdString } from './utils';
import ViewSelector from './ViewSelector';
import TableSearch from './TableSearch';
import { useDictionaryContext } from './DictionaryProvider';
import CategoryPanel from './CategoryPanel';
import GraphView from './GraphView';
import { useScrollIntoView } from '@mantine/hooks';
import { Tabs } from '@mantine/core';

const Dictionary = () => {
  const [selectedId, setSelectedId] = useState('');
  const [view, setView] = useState<ViewType>('table');
  const { dictionary, categories, visibleCategories, config } =
    useDictionaryContext();

  const { scrollIntoView, targetRef, scrollableRef } = useScrollIntoView<
    HTMLSpanElement,
    HTMLDivElement
  >({
    offset: 60,
  });

  const scrollTo = useCallback((item: MatchingSearchResult) => {
    setSelectedId(() => SearchPathToPropertyIdString(item));
  }, []);

  const scrollToSelection = useCallback(
    (itemRef: HTMLSpanElement) => {
      // @ts-expect-error need to refactor this
      (targetRef.current as MutableRefObject<HTMLDivElement>) = itemRef;
      scrollIntoView();
    },
    [scrollIntoView, targetRef],
  );
  const categoryPanelTable =
    Object.keys(categories).length &&
    Object.keys(categories).map((category) => (
      <CategoryPanel
        key={category}
        category={category}
        selectedId={selectedId}
        scrollToSelection={scrollToSelection}
      />
    ));

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
        className="w-3/4 overflow-auto bg-base-lighter"
        ref={scrollableRef as React.Ref<HTMLDivElement>}
      >
        <div className="h-full">
          {config?.showGraph ? (
            <Tabs value={view} keepMounted={false} className="h-full">
              <Tabs.Panel value="table" className="p-4">
                {categoryPanelTable}
              </Tabs.Panel>
              <Tabs.Panel value="graph" className="h-full">
                <GraphView
                  categories={categories}
                  dictionary={dictionary}
                  selectedId={selectedId}
                />
              </Tabs.Panel>
            </Tabs>
          ) : (
            categoryPanelTable
          )}
        </div>
      </div>
    </>
  );
};

export default React.memo(Dictionary);
