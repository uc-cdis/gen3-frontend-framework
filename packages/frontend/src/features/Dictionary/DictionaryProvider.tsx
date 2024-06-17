import React, { createContext, useMemo, useState, ReactNode } from 'react';
import {
  DictionaryProps,
  DictionaryEntry,
  DictionarySearchDocument,
} from './types';
import { JSONObject } from '@gen3/core';
import {
  categoryFilter,
  categoryReduce,
  getDictionaryWithExcludeSystemProperties,
} from './utils';
import { KEY_FOR_SEARCH_HISTORY, MAX_SEARCH_HISTORY } from './constants';

interface DictionaryProviderValue extends DictionaryProps {
  setPropertyDetails: React.Dispatch<React.SetStateAction<JSONObject>>;
  propertyDetails: JSONObject;
  categories: any;
  documents: Array<DictionarySearchDocument>;
  visibleCategories: string[];
}

const DictionaryContext = createContext<DictionaryProviderValue>({
  config: {
    showGraph: false,
    showDownloads: false,
    historyStorageId: KEY_FOR_SEARCH_HISTORY,
    maxHistoryItems: MAX_SEARCH_HISTORY,
  },
  dictionary: {},
  setPropertyDetails: () => null,
  propertyDetails: {} as JSONObject,
  categories: [],
  documents: [],
  visibleCategories: [],
});

const useDictionaryContext = () => {
  const context = React.useContext(DictionaryContext);
  if (context === undefined) {
    throw Error(
      'Discovery must be used  must be used inside of a DiscoveryContext',
    );
  }
  return context;
};

interface DictionaryProviderProps extends DictionaryProps {
  children: ReactNode;
}

const DictionaryProvider = ({
  children,
  config,
  dictionary,
}: DictionaryProviderProps) => {
  const [propertyDetails, setPropertyDetails] = useState<JSONObject>({});

  const processedDictionary =
    getDictionaryWithExcludeSystemProperties(dictionary);

  const categories = useMemo(() => {
    const filtered = Object.keys(processedDictionary);
    const displayedCategories = categoryReduce(filtered, processedDictionary);
    return displayedCategories;
  }, []);

  const visibleCategories = useMemo(
    () =>
      Object.keys(processedDictionary).filter((id) =>
        categoryFilter(id, processedDictionary),
      ),
    [processedDictionary],
  );

  const documents = useMemo<Array<DictionarySearchDocument>>(() => {
    if (Object.keys(categories).length === 0)
      return [] as Array<DictionarySearchDocument>;

    if (Object.keys(categories).length) {
      return (
        Object.keys(categories)
          .map((c) => {
            return categories[c];
          })
          .flatMap((array) => {
            return array.map((d: any) => {
              return Object.keys(d?.properties).map((key) => {
                const { description, type, term, anyOf } = d['properties'][key];
                return {
                  rootCategory: d.category,
                  category: d.id,
                  id: `${d.category}-${d.id}-${key}`,
                  property: key,
                  description:
                    description ??
                    term?.description ??
                    anyOf?.[1]?.properties?.id?.term?.description ??
                    '',
                  type: type ?? anyOf?.[0]?.type ?? '', // TODO add additional types
                };
              });
            });
          }) || []
      ).reduce((acc: DictionaryEntry[], curr: DictionaryEntry[]) => {
        return [...acc, ...curr];
      }, [] as Array<DictionarySearchDocument>);
    }
  }, []);

  return (
    <DictionaryContext.Provider
      value={{
        dictionary: processedDictionary,
        config,
        setPropertyDetails,
        propertyDetails,
        categories,
        documents,
        visibleCategories,
      }}
    >
      {children}
    </DictionaryContext.Provider>
  );
};
export { useDictionaryContext, DictionaryProvider as default };
