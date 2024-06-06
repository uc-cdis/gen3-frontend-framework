import React, { createContext, useMemo, useState, ReactNode } from 'react';
import {
  DataDictionary,
  DictionaryConfigProps,
  DictionaryEntry,
  DictionaryProps,
  DictionarySearchDocument,
} from './types';
import { JSONObject } from '@gen3/core';
import { categoryFilter, categoryReduce } from './utils';

interface DictionaryProviderValue extends DictionaryConfigProps {
  setPropertyDetails: React.Dispatch<React.SetStateAction<JSONObject>>;
  propertyDetails: JSONObject;
  categories: any;
  documents: Array<DictionarySearchDocument>;
  visibleCategories: string[];
}

const DictionaryContext = createContext<DictionaryProviderValue>({
  config: {},
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

  const categories = useMemo(() => {
    const filtered = Object.keys(dictionary).filter((id) =>
      categoryFilter(id, dictionary),
    );
    const displayedCategories = categoryReduce(filtered, dictionary);
    return displayedCategories;
  }, []);

  const visibleCategories = useMemo(
    () =>
      Object.keys(dictionary).filter((id) => categoryFilter(id, dictionary)),
    [dictionary],
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
                  id: `${d.id}-${key}`,
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
  }, [categories]);

  return (
    <DictionaryContext.Provider
      value={{
        dictionary,
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
