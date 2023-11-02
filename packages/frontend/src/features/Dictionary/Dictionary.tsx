import React, { useState, useEffect, useMemo } from 'react';
import {
    MantineReactTable,
    useMantineReactTable,
} from 'mantine-react-table';
import { capitalize } from 'lodash';
import { DictionaryConfig } from "./types";
// import { getCategoryColor, getCategoryIconSVG } from '../../NodeCategories/helper';
// import { downloadTemplate } from '../../utils';

export interface DictionaryProps {
    dictionaryConfig: DictionaryConfig | any;
}

export interface DictionaryCategory<T> {
    [key: string]: T
}
export interface DDLink {
    backref: string;
    label: string;
    multiplicity: string;
    name: string;
    required: boolean;
}

const Dictionary = ({
    dictionaryConfig: dictionary,
}: DictionaryProps) => {
    const [categories, setCategories] = useState({} as DictionaryCategory<any>);
    const [selectedId, setSelectedId] = useState('');
    // filters private categories
    const categoryFilter = (id: string) => id.charAt(0) !== '_' && id === dictionary[id].id && dictionary[id].category && dictionary[id].id && dictionary[id].category.toLowerCase() !== 'internal';

    useEffect(() => {
        const filtered = Object.keys(dictionary).filter((id) => categoryFilter(id));
        const reduced = filtered.map((id) => dictionary[id]).reduce((d, property) => {
            d[property.category] ??= [];
            d[property.category].push(property);
            return d;
        }, {}) as DictionaryCategory<any>;
        setCategories(reduced as Record<string, any>);
    }, [dictionary]);

    const columns = useMemo(
        () => ['property', 'type', 'required', 'description', 'term'].map((key) => ({
            accessorKey: key,
            header: key.toLocaleUpperCase(),
            Cell: ({ cell }: { cell: any }) => (
                <>
                    {key === 'type' ? <>{<ul>{(cell.getValue()?.split(" ") || []).map((cell: any) => {
                        return <li>{cell}</li>
                    })}</ul>}</> : <span>{cell.getValue()}</span>}
                </>
            ),
        })),
        [],
    );

    const tableData = useMemo(() => {
        const keys = dictionary[selectedId]?.properties ? Object.keys(dictionary[selectedId].properties) : [];
        return keys.length ? keys.map((k) => {
            const { properties, required } = dictionary[selectedId];
            const row = properties[k];
            return {
                property: k.split('_').map((name) => capitalize(name)).join(' '),
                type: Object.keys(row).includes('anyOf') ? row.anyOf.map(({ type }: { type: string }) => type).join(" ") : row.type,
                required: required.includes(k) ? 'Required' : 'No',
                description: row?.description ?? row?.term?.description ?? 'No Description',
                term: '',
            };
        }) : [];
    }, [selectedId]);

    const handleSelect = (id: string) => {
        setSelectedId((i) => (i === id ? '' : id));
    };

    const table = useMantineReactTable({
        columns,
        data: tableData,
        enablePagination: false,
        enableBottomToolbar: false,
        enableTopToolbar: false
    });

    const getCategoryColor = (category: string) => {
        // todo
        return "gray"
    }
    const visibleCategories = Object.keys(dictionary).filter((id) => categoryFilter(id));
    return (
        <div>
            <span>{`dictionaryName dictionary has ${visibleCategories.length} nodes and ${visibleCategories.map((n) => Object.keys(dictionary[n]?.properties)?.length ?? 0).reduce((acc, curr) => acc + curr)} properties`}</span>
            <React.Fragment>{Object.keys(categories).map((c) => {
                // const IconSVG = getCategoryIconSVG(c);
                return (
                    // todo add category color
                    <div className={`border-l-4 border-${getCategoryColor(c)} mt-10`}>
                        <h4 className="flex text-white bg-black border mb-0 h-40 justify-between">
                            <div className="flex">
                                {/* <div className="p-10 align-middle"><IconSVG /></div> */}
                                <div style={{ padding: 5, marginLeft: 0 }}>{c.split('_').map((name) => capitalize(name)).join(' ')}</div>
                            </div>
                            <div style={{ padding: 5, verticalAlign: "middle" }}>Download Template</div>
                        </h4>
                        <div style={{ border: "1px solid black", borderLeft: 0 }}>{(categories[c] as unknown as any[]).map(({ title, description, id }, key) => (
                            <div onClick={() => handleSelect(id)} style={{ display: "flex", flexDirection: "column", padding: 2 }}>
                                <div
                                    key={key}
                                    className={`flex justify-between ${key < (categories[c] as any[]).length - 1 ? 'border-b border-black' : ''} bg-white hover:text-highlight`}>
                                    <div className="flex-grow-0 flex-shrink-0 w-260 p-10">{title}</div>
                                    <div className="flex-grow-1">{description}</div>
                                    <div className="flex text-xs flex-grow-0 flex-shrink-0 justify-between items-center pt-5">
                                        <button onClick={(e) => {
                                            e.stopPropagation();
                                            // downloadTemplate('json', id);
                                        }} className="h-30 w-60 mx-5 text-white bg-blue-500">JSON</button>
                                        <button onClick={(e) => {
                                            e.stopPropagation();
                                            // downloadTemplate('tsv', id);
                                        }} className="h-30 w-60 mx-5 text-white bg-custom-blue">TSV</button>
                                    </div>
                                </div>
                                <div>
                                    {selectedId === id ? (
                                        <div onClick={(e) => e.stopPropagation()} key={selectedId}>
                                            <MantineReactTable table={table} />
                                        </div>
                                    ) : undefined}
                                </div>
                            </div>
                        ))}
                        </div>
                    </div>
                )
            })}
            </React.Fragment>
        </div>
    );
};

export default Dictionary;
