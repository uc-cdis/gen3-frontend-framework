import React, { forwardRef, useEffect, useMemo, useState } from 'react';
import {
  MantineReactTable,
  useMantineReactTable,
  MRT_Cell,
} from 'mantine-react-table';
import { MdClose as CloseIcon, MdSearch as SearchIcon } from 'react-icons/md';
import {
  Accordion,
  Autocomplete,
  Button,
  Group,
  Highlight,
} from '@mantine/core';
import { capitalize } from 'lodash';
import { DictionaryCategory, DictionaryEntry, DictionaryProps } from './types';
import { categoryFilter, categoryReduce, getPropertyCount } from './utils';
import Cell from './Cell';
import { Icon } from '@iconify/react';
import ResultCard from './ResultCard';
import { useMiniSearch } from 'react-minisearch';
import MiniSearch from 'minisearch';
import CategoryHeader from './CategoryHeader';
import CategoryAccordionLabel from './CategoryAccordionLabel';

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
}

const Dictionary = ({
  dictionaryConfig: dictionary,
  uidForStorage = 'dictionary',
}: DictionaryProps) => {
  const [categories, setCategories] = useState(
    {} as DictionaryCategory<DictionaryEntry | any>,
  );
  const [selectedId, setSelectedId] = useState('');
  const [view, setView] = useState('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [dictionarySearchResults, setDictionarySearchResults] = useState(
    {} as any,
  );
  const [dictionarySearchHistory, setDictionarySearchHistory] =
    useState<DictionarySearchHistoryObj>({});
  const [dictionaryTableRows, setDictionaryTableRows] = useState<
    [] | JSX.Element[]
  >([]);
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    const filtered = Object.keys(dictionary).filter((id) =>
      categoryFilter(id, dictionary),
    );
    const displayedCategories = categoryReduce(filtered, dictionary);
    setCategories(displayedCategories);
  }, [dictionary]);

  useEffect(() => {
    if (Object.keys(categories).length) {
      setDocuments(
        (
          Object.keys(categories)
            .map((c) => {
              return categories[c];
            })
            .flatMap((array) => {
              return array.map((d: any) => {
                return Object.keys(d?.properties).map((key) => {
                  const { description, type, term, anyOf } =
                    d['properties'][key];
                  return {
                    id: `${d.id}-${key}`,
                    property: key,
                    description:
                      description ??
                      term?.description ??
                      anyOf?.[1]?.properties?.id?.term?.description ??
                      '',
                    type: type ?? anyOf?.[0]?.type ?? '',
                  };
                });
              });
            }) || []
        ).reduce((acc: DictionaryEntry[], curr: DictionaryEntry[]) => {
          return [...acc, ...curr];
        }, []),
      );
    }
  }, [categories]);

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
    search(searchTerm);
    autoSuggest(searchTerm);
  }, [searchTerm, autoSuggest, search]);

  useEffect(() => {
    removeAll();
    addAll(documents);
  }, [documents, suggestions, addAll, removeAll]);

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

  const removeDictionarySearchHistory = () => {
    sessionStorage.setItem(uidForStorage, JSON.stringify({}));
    setDictionarySearchHistory({});
    setDictionaryTableRows([]);
  };

  const columns = useMemo(() => {
    return [
      {
        id: 'decorator',
        header: '',
        Cell: ({ cell }: { cell: MRT_Cell<Record<string, string>> }) => {
          return <div>|</div>;
        },
      },
      ...['property', 'type', 'required', 'description'].map((key) => ({
        accessorKey: key,
        header: key.toLocaleUpperCase(),
        Cell: ({ cell }: { cell: MRT_Cell<Record<string, string>> }) => (
          <Cell cell={cell} key={key} />
        ),
      })),
    ];
  }, []);

  const tableData = useMemo(() => {
    const keys = dictionary[selectedId]?.properties
      ? Object.keys(dictionary[selectedId].properties)
      : [];
    return keys.length
      ? keys.map((k) => {
          const { properties, required } = dictionary[selectedId];
          const row = properties[k];
          return {
            property: k
              .split('_')
              .map((name) => capitalize(name))
              .join(' '),
            type: Object.keys(row).includes('anyOf')
              ? row.anyOf.map(({ type }: { type: string }) => type).join(' ')
              : row.type,
            required: required.includes(k) ? 'Required' : 'No',
            description:
              row?.description ?? row?.term?.description ?? 'No Description',
          };
        })
      : [];
  }, [selectedId, dictionary]);

  const handleSelect = (id: string) => {
    setSelectedId((i) => (i === id ? '' : id));
  };

  const table = useMantineReactTable({
    columns,
    data: tableData,
    enablePagination: false,
    enableBottomToolbar: false,
    enableTopToolbar: false,
    mantineTableHeadRowProps: {
      bg: 'rgb(206, 203, 228)',
    },
    mantineTableBodyRowProps: {
      sx: {
        borderWidth: 2,
      },
    },
    mantineTableProps: {
      striped: true,
      sx: {
        borderSpacing: '0rem 0.25rem',
        borderCollapse: 'separate',
      },
    },
  });

  const visibleCategories = Object.keys(dictionary).filter((id) =>
    categoryFilter(id, dictionary),
  );

  const snakeSplit = (snake: string) => {
    return snake
      .split('_')
      .map((name) => capitalize(name))
      .join(' ');
  };

  const getSearchResults = (searchEntered: string) => {
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
    setDictionarySearchResults({
      term: searchTerm,
      matches: matches.sort((a, b) => a.node.localeCompare(b.node)),
    });
  };

  const iconMapping: Record<string, string> = {
    administrative: 'administrative',
    data_observations: 'analysis',
    biospecimen: 'query',
    data_file: 'workspace',
    medical_history: 'profile',
  };

  const getIcon = (category: string) => {
    const iconName = iconMapping[category] ? iconMapping[category] : 'gen3';
    return <Icon icon={`gen3:${iconName}`} />;
  };

  const SuggestedItem = forwardRef<HTMLDivElement, SuggestionProps>(
    function SuggestedItem({ value, ...others }: SuggestionProps, ref) {
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
            <Highlight highlight={searchTerm}>{value}</Highlight>
          </button>
        </div>
      );
    },
  );

  const suggestedData = (suggestions || [])?.map(({ suggestion }) => {
    return { value: suggestion };
  });

  return (
    <div className="flex m-2 bg-base-max">
      <div className="w-1/4 mr-4">
        <div className="flex justify-center border-t-0 border-1 border-gray-400 py-10">
          <button
            className={`${
              view === 'table'
                ? 'bg-purple-950 text-white'
                : 'bg-white text-purple-950'
            } text-sm py-2 px-10 rounded-tl-md rounded-bl-md border-2 border-purple-950`}
            onClick={() => setView('table')}
          >
            Table View
          </button>
          <button
            className={`${
              view === 'graph'
                ? 'bg-purple-950 text-white'
                : 'bg-white text-purple-950'
            } text-sm py-2 px-10 rounded-tr-md rounded-br-md border-2 border-purple-950`}
            onClick={() => setView('graph')}
          >
            Graph View
          </button>
        </div>
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
        <div className="flex flex-col">
          <div className="flex mb-1">
            <button
              className={`border p-1 ${
                searchTerm.length !== 0
                  ? 'text-orange-500 border-orange-500'
                  : 'text-gray-300 border-gray-300'
              } ml-auto mr-2 rounded-md items-center`}
              disabled={searchTerm.length === 0}
              onClick={() => getSearchResults(searchTerm)}
            >
              Search
            </button>
          </div>
          <Autocomplete
            itemComponent={SuggestedItem}
            data={suggestedData}
            icon={<SearchIcon size={24} />}
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
            <button
              className={`text-orange-500 p-1 border text-orange-500 border-orange-500 ml-auto mr-2 rounded-md items-center`}
              onClick={() => removeDictionarySearchHistory()}
            >
              Clear All
            </button>
          </div>
          {dictionaryTableRows?.length ? <>{dictionaryTableRows}</> : <></>}
        </div>
      </div>
      <div className="w-3/4">
        {Object.keys(categories).length &&
          Object.keys(categories).map((category) => {
            const categoryInfo: Array<DictionaryCategory<string>> =
              categories[category];
            return (
              <div
                className="border-l-4 border-purple mt-2"
                key={`dictionary-entry-${category}`}
              >
                <CategoryHeader icon={getIcon(category)} category={category} />
                <Accordion
                  chevronPosition="left"
                  defaultValue={selectedId}
                  onChange={handleSelect}
                  styles={{
                    chevron: {
                      transform: 'rotate(-90deg)',
                      '&[data-rotate]': {
                        transform: 'rotate(0deg)',
                      },
                    },
                  }}
                >
                  {categoryInfo.map(({ title, description, id }) => {
                    return (
                      <Accordion.Item value={id} key={id}>
                        <Group noWrap>
                          <Accordion.Control>
                            <CategoryAccordionLabel
                              label={title}
                              description={description}
                            />
                          </Accordion.Control>
                          <Group noWrap className="ml-auto">
                            <Button>TSV</Button>
                            <Button>JSON</Button>
                          </Group>
                        </Group>
                        <Accordion.Panel>
                          <div className="ml-2">
                            <div className="flex flex-col mt-2">
                              <MantineReactTable table={table} />
                            </div>
                          </div>
                        </Accordion.Panel>
                      </Accordion.Item>
                    );
                  })}
                </Accordion>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default Dictionary;
