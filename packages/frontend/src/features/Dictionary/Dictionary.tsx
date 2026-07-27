import React, { MutableRefObject, useCallback, useState } from 'react';
import { Tabs } from '@mantine/core';
import { useScrollIntoView } from '@mantine/hooks';
import CategoryPanel from './CategoryPanel';
import { useDictionaryContext } from './DictionaryProvider';
import GraphView from './GraphView';
import TableSearch from './TableSearch';
import { MatchingSearchResult, ViewType } from './types';
import { SearchPathToPropertyIdString } from './utils';
import ViewSelector from './ViewSelector';

const CATEGORY_STYLES: Record<string, { badge: string; icon: string }> = {
  administrative: { badge: '#ede9fe', icon: '#8b5cf6' },
  analysis: { badge: '#fce7f3', icon: '#ec4899' },
  clinical: { badge: '#e0f2fe', icon: '#0ea5e9' },
  'experimental-methods': { badge: '#ffedd5', icon: '#ea580c' },
  'data-file': { badge: '#ecfccb', icon: '#65a30d' },
  biospecimen: { badge: '#d1fae5', icon: '#10b981' },
  default: { badge: '#e2e8f0', icon: '#64748b' },
};

const normalizeCategory = (value?: string) =>
  (value ?? 'default').trim().toLowerCase().replace(/\s+/g, '-');

const getCategoryStyle = (category?: string) =>
  CATEGORY_STYLES[normalizeCategory(category)] ?? CATEGORY_STYLES.default;

const toGlyph = (category?: string) => {
  const label = (category ?? '?').trim();
  return label ? label.charAt(0).toUpperCase() : '?';
};

const Dictionary = () => {
  const [selectedId, setSelectedId] = useState('');
  const [view, setView] = useState<ViewType>('table');
  const [graphStructure, setGraphStructure] = useState<
    Array<{ id: string; title: string; category?: string; isActive: boolean }>
  >([]);
  const { dictionary, categories, config } = useDictionaryContext();

  const { scrollIntoView, targetRef, scrollableRef } = useScrollIntoView<
    HTMLSpanElement,
    HTMLDivElement
  >({
    offset: 60,
  });

  const scrollTo = useCallback((item: MatchingSearchResult) => {
    setSelectedId(SearchPathToPropertyIdString(item));
    setView('table');
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
    Object.keys(categories).length > 0
      ? Object.keys(categories).map((category) => (
          <CategoryPanel
            key={category}
            category={category}
            selectedId={selectedId}
            scrollToSelection={scrollToSelection}
          />
        ))
      : null;

  return (
    <div className="grid h-full min-h-0 w-full min-w-0 grid-cols-[320px_minmax(0,1fr)]">
      <aside className="overflow-auto border-r border-base-light bg-white">
        <div className="sticky top-0 z-20 border-b border-base-light bg-white/95 p-6 backdrop-blur">
          {config?.showGraph ? <ViewSelector view={view} setView={setView} /> : null}
          <div className="mt-5">
            <TableSearch selectItem={scrollTo} />
          </div>
        </div>

        {view === 'graph' && graphStructure.length > 0 ? (
          <div className="border-b border-base-light bg-white px-6 py-6">
            <div className="space-y-2">
              {graphStructure.map((node) => {
                const style = getCategoryStyle(node.category);
                return (
                  <div
                    key={node.id}
                    className={`flex items-center gap-3 rounded-xl px-2 py-2 ${
                      node.isActive ? 'bg-sky-50' : ''
                    }`}
                  >
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
                      style={{ backgroundColor: style.badge, color: style.icon }}
                    >
                      {toGlyph(node.category)}
                    </span>
                    <span
                      className={`text-[18px] font-semibold ${
                        node.isActive ? 'text-sky-600' : 'text-slate-800'
                      }`}
                    >
                      {node.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}
      </aside>

      <section
        className="h-full w-full min-w-0 overflow-hidden bg-base-lighter"
        ref={scrollableRef as React.Ref<HTMLDivElement>}
      >
        {config?.showGraph ? (
          <Tabs value={view} keepMounted={false} className="h-full">
            <Tabs.Panel
              value="table"
              className="h-full overflow-auto bg-white px-0 py-3"
            >
              {categoryPanelTable}
            </Tabs.Panel>
            <Tabs.Panel value="graph" className="h-full">
              <GraphView
                dictionary={dictionary}
                selectedId={selectedId}
                onStructureChange={setGraphStructure}
              />
            </Tabs.Panel>
          </Tabs>
        ) : (
          <div className="h-full overflow-auto p-4">{categoryPanelTable}</div>
        )}
      </section>
    </div>
  );
};

export default React.memo(Dictionary);
