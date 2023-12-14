import React, { useState, useEffect, useMemo } from 'react';
import { MantineReactTable, useMantineReactTable } from 'mantine-react-table';
import { capitalize } from 'lodash';
import { DictionaryConfig } from './types';
// import { getCategoryColor, getCategoryIconSVG } from '../../NodeCategories/helper';
// import { downloadTemplate } from '../../utils';

export interface DictionaryProps {
  dictionaryConfig: DictionaryConfig | any;
}

export interface DictionaryCategory<T> {
  [key: string]: T;
}
export interface DDLink {
  backref: string;
  label: string;
  multiplicity: string;
  name: string;
  required: boolean;
}

const Dictionary = ({ dictionaryConfig: dictionary }: DictionaryProps) => {
  const [categories, setCategories] = useState({} as DictionaryCategory<any>);
  const [selectedId, setSelectedId] = useState('');
  // filters private categories
  const categoryFilter = (id: string) =>
    id.charAt(0) !== '_' &&
    id === dictionary[id].id &&
    dictionary[id].category &&
    dictionary[id].id &&
    dictionary[id].category.toLowerCase() !== 'internal';

  useEffect(() => {
    const filtered = Object.keys(dictionary).filter((id) => categoryFilter(id));
    const reduced = filtered
      .map((id) => dictionary[id])
      .reduce((d, property) => {
        d[property.category] ??= [];
        d[property.category].push(property);
        return d;
      }, {}) as DictionaryCategory<any>;
    setCategories(reduced as Record<string, any>);
  }, [dictionary]);

  const columns = useMemo(
    () =>
      ['property', 'type', 'required', 'description', 'term'].map((key) => ({
        accessorKey: key,
        header: key.toLocaleUpperCase(),
        Cell: ({ cell }: { cell: any }) => (
          <>
            {key === 'type' ? (
              <>
                {
                  <ul>
                    {(cell.getValue()?.split(' ') || []).map((cell: any) => {
                      return <li>{cell}</li>;
                    })}
                  </ul>
                }
              </>
            ) : (
              <span>{cell.getValue()}</span>
            )}
          </>
        ),
      })),
    [],
  );

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
          term: '',
        };
      })
      : [];
  }, [selectedId]);

  const handleSelect = (id: string) => {
    setSelectedId((i) => (i === id ? '' : id));
  };

  const table = useMantineReactTable({
    columns,
    data: tableData,
    enablePagination: false,
    enableBottomToolbar: false,
    enableTopToolbar: false,
  });

  const visibleCategories = Object.keys(dictionary).filter((id) =>
    categoryFilter(id),
  );

  const handleDownloadTemplate = (e: Event) => {
    console.log(e);
  }

  return (
    <div>
      <span>{`Data Dictionary has ${visibleCategories.length
        } nodes and ${visibleCategories
          .map((n) => Object.keys(dictionary[n]?.properties)?.length ?? 0)
          .reduce((acc, curr) => acc + curr)} properties`}</span>
      <React.Fragment>
        {Object.keys(categories).length && Object.keys(categories).map((c) => {
          // const IconSVG = getCategoryIconSVG(c);
          return (
            <div className={`border-l-4 border-purple mt-10`}>
              <h4 className="flex text-white font-bold font-size-md bg-purple-950 border mb-0 justify-between">
                <div className="flex">
                  {/* <div className="p-10 align-middle"><IconSVG /></div> */}
                  <div className="p-5 ml-0">
                    {c
                      .split('_')
                      .map((name) => capitalize(name))
                      .join(' ')}
                  </div>
                </div>
                <div className="p-5 align-middle">
                  Download Template
                </div>
              </h4>
              <div className="w-full border border-solid border-black border-t-0">
                {(categories[c] as unknown as any[]).map(
                  ({ title, description, id }, key) => (
                    <div
                      tabIndex={key}
                      role="button"
                      onClick={() => handleSelect(id)}
                      className="flex flex-col p-2"
                      key={title}
                    >
                      <div
                        key={key}
                        className={`flex w-full mb-2 ${key < (categories[c] as any[]).length - 1
                          ? 'border-b border-black'
                          : ''
                          } bg-white hover:text-highlight`}
                      >
                        <div className="w-1/5 flex-grow-0 flex-shrink-0 text-left font-bold text-sm">
                          {title}
                        </div>
                        <div className="w-3/5 align-left text-left">{description}</div>
                        <div className="w-1/5 flex text-sm justify-end mr-5 items-center mt-0">
                          <button
                            onClick={handleDownloadTemplate}
                            className="text-xs p-1.5 text-white bg-orange-500 rounded-sm mr-1 h-6"
                          >
                            JSON
                          </button>
                          <button
                            onClick={handleDownloadTemplate}
                            className="text-xs p-1.5 text-white bg-orange-500 rounded-sm ml-1 h-6"
                          >
                            TSV
                          </button>
                        </div>
                      </div>
                      <div>
                        {selectedId === id ? (
                          <div
                            role="button"
                            onClick={(e) => e.stopPropagation()}
                            key={selectedId}
                          >
                            <MantineReactTable table={table} />
                          </div>
                        ) : <></>}
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>
          );
        })}
      </React.Fragment>
    </div>
  );
};

export default Dictionary;
