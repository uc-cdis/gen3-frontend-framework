import { Text } from '@mantine/core';
import { useGetDataLibraryListsQuery } from '@gen3/core';
import { data1 } from "./utils";
import { useEffect, useState } from 'react';

interface Dataset {
  name: string;
  items: {
    [key: string]: {
      dataset_guid?: string;
      description?: string;
      docsUrl?: string;
      type?: string;
    };
  };
}

interface Datasets {
  [key: string]: Dataset | undefined;
}

interface Query {
  name: string;
  description: string;
  type: string;
}

interface File {
  name: string;
  description?: string;
  type?: string;
  size?: string;
}

interface AdditionalData {
  name: string;
  description: string;
  documentation: string;
}
interface DataLibraryList {
  name: string;
  queries: Query[];
  files: File[];
  additionalData: AdditionalData[];
}

const DataLibraryPanel = () => {
  const [currentLists, setCurrentLists] = useState([] as DataLibraryList[]);

  useEffect(() => {
    const savedLists = data1["lists"].map(({ name, items, version }) => {
      const queries = Object.keys(items).reduce((acc, curr) => {
        let listType = items[curr]['items'] ? "items" : 'gql';
        const { name,
          // schema_version,
          //  data,
          type } = items[curr];
        if (listType === 'gql') {
          acc.push({
            name,
            // todo: include this for table
            description: "",
            // schema_version,
            // data,
            type
          })
        }
        return acc
      }, [] as any);
      const files = Object.keys(items).reduce((acc, curr) => {
        let listType = items[curr]['items'] ? "items" : 'gql';
        if (listType === 'items') {
          Object.keys(items[curr]['items']).forEach((i) => {
            if (items[curr]['items'][i]?.['type'] !== "AdditionalData") {
              const { description = "", type = "", size = "" } = items[curr]['items'][i];
              acc.push({
                name: i,
                description,
                type,
                size
              })
            }
          });
        }
        return acc
      }, [] as any);
      const additionalData = Object.keys(items).reduce((acc, curr) => {
        let listType = items[curr]['items'] ? "items" : 'gql';
        if (listType === 'items') {
          Object.keys(items[curr]['items']).forEach((i) => {
            if (items[curr]['items'][i]?.['type'] === "AdditionalData") {
              const { description = "", docsUrl: documentation = "" } = items[curr]['items'][i];
              acc.push({
                name: i,
                description,
                documentation
              })
            }
          });
        }
        return acc
      }, [] as any);
      return {
        name,
        queries,
        files,
        additionalData
      }
    });
    console.log('savedLists', savedLists);
    setCurrentLists(savedLists);
  }, [data1]);

  return (
    <div>
      <div className="flex flex-col">
        {currentLists.map(({ name, queries, files, additionalData}) => {
          return <div className="flex flex-col">
                <div>{name}</div>

          </div>
        })}
      </div>
    </div>
  );
};

export default DataLibraryPanel;
