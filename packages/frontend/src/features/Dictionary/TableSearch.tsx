import React, {
  forwardRef,
  ReactElement,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { Button, Autocomplete, Highlight } from '@mantine/core';
import { MdClose as CloseIcon, MdSearch as SearchIcon } from 'react-icons/md';
import ResultCard from './ResultCard';
import { useMiniSearch } from 'react-minisearch';
import MiniSearch, { Suggestion } from 'minisearch';
import { capitalize } from 'lodash';
import { snakeSplit } from './utils';
import { DictionaryCategory, DictionaryEntry } from './types';
import { useDeepCompareMemo } from 'use-deep-compare';

const getSearchResults = (
  searchEntered: string,
  categories: DictionaryCategory<DictionaryEntry | any>,
) => {
  const dictionary = Object.keys(categories).map((c) => {
    return categories[c];
  });
  const matches = [] as Record<string, string>[];
  dictionary.forEach((category) => {
    category.forEach((d: any) => {
      return Object.keys(d?.properties).forEach((p) => {
        const { description, type, term, anyOf } = d['properties'][p];
        const results = [
          {
            description:
              description ??
              term?.description ??
              anyOf?.[1]?.properties?.id?.term?.description ??
              '',
          },
          { type: type ?? anyOf?.[0]?.type ?? '' },
          { property: snakeSplit(p) },
        ];
        results.forEach((r) => {
          if (
            (Object.values(r)[0].toLowerCase() as 'string').includes(
              searchEntered.toLowerCase(),
            )
          ) {
            matches.push({
              node: snakeSplit(d.category),
              category: snakeSplit(d.id),
              property: capitalize(results[2].property),
            });
          }
        });
      });
    });
  });
  return matches.sort((a, b) => a.node.localeCompare(b.node));
};

interface SearchMatches {
  node: string;
  category: string;
  property: string;
}

interface DictionarySearchHistoryObj {
  [key: string]: {
    matches?: SearchMatches[];
    term: string;
  };
}

interface SuggestionProps {
  value: string;
  suggestions: Suggestion[];
  searchTerm: string;
  setSearchTerm: (_: string) => void;
}

const SuggestedItem = forwardRef<HTMLDivElement, SuggestionProps>(
  function SuggestedItem(
    {
      value,
      suggestions,
      searchTerm,
      setSearchTerm,
      ...others
    }: SuggestionProps,
    ref,
  ) {
    return (
      <div
        ref={ref}
        {...others}
        className={`h-inherit w-inherit hover:cursor-pointer hover:bg-gray-100 border border-solid border-gray-200 p-1 ${
          (suggestions || [])
            .map(({ suggestion }) => suggestion)
            .indexOf(value) !== 0 && 'border-t-0'
        }`}
      >
        <button className="border-none" onClick={() => setSearchTerm(value)}>
          <Highlight color="blue" highlight={searchTerm}>
            {value}
          </Highlight>
        </button>
      </div>
    );
  },
);

interface TableSearchProps {
  selectedId: string;
  documents: never[];
  uidForStorage?: string;
  categories: DictionaryCategory<DictionaryEntry | any>;
}

const TableSearch = ({
  documents,
  categories,
  uidForStorage = 'dictionary',
}: TableSearchProps): ReactElement => {
  const [dictionarySearchResults, setDictionarySearchResults] = useState(
    {} as any,
  );
  const [dictionarySearchHistory, setDictionarySearchHistory] =
    useState<DictionarySearchHistoryObj>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [dictionaryTableRows, setDictionaryTableRows] = useState<
    [] | JSX.Element[]
  >([]);

  const removeDictionarySearchHistory = useCallback(() => {
    sessionStorage.setItem(uidForStorage, JSON.stringify({}));
    setDictionarySearchHistory({});
    setDictionaryTableRows([]);
  }, []);

  const { search, autoSuggest, suggestions, addAll, removeAll } = useMiniSearch(
    documents,
    {
      fields: ['description', 'type', 'property'],
      idField: 'id',
      storeFields: ['id'],
      searchOptions: {
        processTerm: MiniSearch.getDefault('processTerm'),
      },
    },
  );

  useEffect(() => {
    if (searchTerm.length > 1) {
      search(searchTerm);
      autoSuggest(searchTerm);
    }
  }, [searchTerm, autoSuggest, search]);

  useEffect(() => {
    removeAll();
    addAll(documents);
  }, [documents, suggestions, addAll, removeAll]);

  useEffect(() => {
    if (searchTerm === '') setDictionarySearchResults({});
  }, [searchTerm]);

  useEffect(() => {
    setDictionarySearchHistory(
      JSON.parse(sessionStorage.getItem(uidForStorage) || '{}'),
    );
  }, [uidForStorage]);

  useEffect(() => {
    if (dictionarySearchHistory) {
      sessionStorage.setItem(
        uidForStorage,
        JSON.stringify(dictionarySearchHistory),
      );
    }
  }, [uidForStorage, dictionarySearchHistory]);

  useEffect(() => {
    const cachedData = JSON.parse(
      sessionStorage.getItem(uidForStorage) || '{}',
    );
    if (
      dictionarySearchResults?.term?.length &&
      !Object.keys(cachedData).includes(dictionarySearchResults?.term) &&
      dictionarySearchResults?.matches?.length
    ) {
      sessionStorage.setItem(
        uidForStorage,
        JSON.stringify({
          ...cachedData,
          [dictionarySearchResults?.term]: dictionarySearchResults.matches,
        }),
      );
      setDictionarySearchHistory({
        ...cachedData,
        [dictionarySearchResults?.term]: dictionarySearchResults.matches,
      });
    }
  }, [dictionarySearchResults, uidForStorage]);

  useEffect(() => {
    if (dictionarySearchHistory) {
      setDictionaryTableRows(
        Object.keys(dictionarySearchHistory).map((d) => {
          return (
            <div key={`dictionary-table-row-${d}`} className="my-2">
              <ResultCard
                term={d}
                matches={dictionarySearchHistory?.[d] as unknown as []}
              />
            </div>
          );
        }),
      );
    }
  }, [dictionarySearchResults, dictionarySearchHistory]);

  const suggestedData = useDeepCompareMemo(
    () =>
      (suggestions || [])?.map(({ suggestion }) => {
        return { value: suggestion };
      }),
    [suggestions],
  );

  return (
    <>
      <div className="flex flex-col">
        <div className="flex mb-1">
          <button
            className={`border p-1 ${
              searchTerm.length !== 0
                ? 'text-orange-500 border-orange-500'
                : 'text-gray-300 border-gray-300'
            } ml-auto mr-2 rounded-md items-center`}
            disabled={searchTerm.length === 0}
            onClick={() =>
              setDictionarySearchResults({
                term: searchTerm,
                matches: getSearchResults(searchTerm, categories),
              })
            }
          >
            Search
          </button>
        </div>
        <Autocomplete
          itemComponent={(props: any) => (
            <SuggestedItem searchTerm={searchTerm} {...props} />
          )}
          data={suggestedData}
          icon={<SearchIcon size={24} className="text-accent" />}
          placeholder={'Search in Dictionary'}
          data-testid="dictionary-textbox-search-bar"
          aria-label="Dictionary Search Input"
          value={searchTerm}
          onChange={(value) => {
            setSearchTerm(value as string);
          }}
          classNames={{
            input: 'focus:border-2 focus:border-primary text-sm p-5',
          }}
          size="sm"
          rightSection={
            searchTerm.length > 0 && (
              <CloseIcon
                onClick={() => {
                  setSearchTerm('');
                }}
                className="cursor-pointer"
              />
            )
          }
        />
      </div>
      <div className="p-3">
        <span className="flex flex-col font-semibold text-sm">
          Search Results
        </span>
        {dictionarySearchResults?.matches?.length > 0 ? (
          <ResultCard
            term={dictionarySearchResults?.term}
            matches={dictionarySearchResults?.matches}
          />
        ) : (
          <span className="text-xs items-center">
            Try a different search query
          </span>
        )}
      </div>
      <div className="p-3">
        <div className="flex justify-between">
          <span className="flex flex-col font-semibold text-sm">
            Search History
          </span>
          <Button
            variant="outline"
            radius="md"
            onClick={() => removeDictionarySearchHistory()}
          >
            Clear All
          </Button>
        </div>
        {dictionaryTableRows?.length ? (
          <React.Fragment>{dictionaryTableRows}</React.Fragment>
        ) : (
          <React.Fragment></React.Fragment>
        )}
      </div>
    </>
  );
};

export default TableSearch;
