import React, { useState, useEffect, useMemo, ReactNode } from 'react';
import { MantineReactTable, useMantineReactTable } from 'mantine-react-table';
import { capitalize } from 'lodash';
import { DictionaryCategory, DictionaryProps } from './types';
import { RiDownload2Fill, RiCloseFill } from 'react-icons/ri';
import { IoIosArrowDown, IoIosArrowForward } from 'react-icons/io';
import { categoryFilter, categoryReduce, getPropertyCount } from './utils';
import Cell from './Cell';
import { Icon } from '@iconify/react';

const Dictionary = ({ dictionaryConfig: dictionary }: DictionaryProps) => {
  const [categories, setCategories] = useState({} as DictionaryCategory<any>);
  const [selectedId, setSelectedId] = useState('');

  useEffect(() => {
    const filtered = Object.keys(dictionary).filter((id) => categoryFilter(id, dictionary));
    const displayedCategories = categoryReduce(filtered, dictionary);
    setCategories(displayedCategories);
  }, [dictionary]);

  const columns = useMemo(
    () =>
      ['property', 'type', 'required', 'description', 'term'].map((key) => ({
        accessorKey: key,
        header: key.toLocaleUpperCase(),
        Cell: ({ cell }: { cell: any }) => <Cell cell={cell} key={key} />,
      })),
    [],
  );

  const tableData = useMemo(() => {
    const keys = dictionary[selectedId]?.properties
      ? Object.keys(dictionary[selectedId].properties)
      : [];
    // formats data for mantine subtables w/in each category
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
    categoryFilter(id, dictionary),
  );

  const handleDownloadTemplate = (e: any) => {
    console.log(e);
  };
  const getIcon = (category: string) => {
    // todo: replace with appropriate icons
    // ideally render as <Icon icon={`gen3:${c}`} /> where c is category
    switch (category) {
      case 'administrative':
        return <Icon icon={'gen3:administrative'} />;
      case 'data_observations':
        return <Icon icon={'gen3:analysis'} />;
      case 'biospecimen':
        return <Icon icon={'gen3:query'} />;
      case 'data_file':
        return <Icon icon={'gen3:workspace'} />;
      case 'medical_history':
        return <Icon icon={'gen3:profile'} />;
      default:
        return <Icon icon={'gen3:gen3'} />;
    }
  };

  return (
    <div>
      <span>{`Data Dictionary has ${visibleCategories.length
        } nodes and ${getPropertyCount(visibleCategories, dictionary)} properties`}
      </span>
      <div>
        {Object.keys(categories).length && Object.keys(categories).map((c) => {
          return (
            <div className={'border-l-4 border-purple mt-10'} key={`dictionary-entry-${c}`}>
              <h3 className="flex text-white font-bold font-size-md bg-purple-950 border mb-0 justify-between h-16">
                <div className="p-5 align-middle">{getIcon(c)}</div>
                <div className="flex p-5 ml-0">
                  {c
                    .split('_')
                    .map((name) => capitalize(name))
                    .join(' ')}
                </div>
              </h3>
              <div className="w-full border border-solid border-black border-t-0">
                {(categories[c] as unknown as any[]).map(
                  ({ title, description, id }, key) => {
                    return (<div
                      tabIndex={key}
                      role="button"
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

                        <div onClick={() => handleSelect(id)} className="flex w-1/5 flex-grow-0 flex-shrink-0 text-left font-bold text-sm items-center">
                          {selectedId === id ? <IoIosArrowDown /> : <IoIosArrowForward />}<span className="ml-1">{title}</span>
                        </div>

                        <div className="w-3/5 align-left text-left">{description}</div>

                        <div className="w-1/5 flex text-sm justify-end mr-5 items-center mt-0">
                          <button
                            onClick={(e) => handleDownloadTemplate(e)}
                            className="text-xs p-1 text-white bg-orange-500 rounded-sm mr-1 h-6 items-center"
                          >
                            <div className="flex "><RiDownload2Fill /><span className="ml-1">JSON</span></div>
                          </button>

                          <button
                            onClick={handleDownloadTemplate}
                            className="text-xs p-1 text-white bg-orange-500 rounded-sm ml-1 h-6 items-center"
                          >
                            <div className="flex"><RiDownload2Fill />
                              <span className="ml-1">TSV</span>
                            </div>
                          </button>
                        </div>
                      </div>

                      <div>
                        {selectedId === id ? (
                          <div
                            key={selectedId}
                          >
                            <div className="flex flex-col">
                              <button onClick={() => setSelectedId('')}><RiCloseFill /></button>
                              <MantineReactTable table={table} />
                            </div>
                          </div>
                        ) : <React.Fragment></React.Fragment>}
                      </div>
                    </div>);
                  })}
              </div>
            </div>);
        })}
      </div>
    </div>);
};

export default Dictionary;
