#!/usr/bin/env node

import { Args, getArgs } from '../utils';
import { promises as fs } from 'fs';

export type IndexAndField = {
  index: string; // guppyIndex
  indexAlias?: string; // alias for index, e.g. tabTitle
  field: string; // name of field in index
};

export const groupSharedFields = (data: Record<string, string[]>) => {
  const reverseIndex: Record<string, Set<string>> = {};

  // Build reverse index: track which root keys contain each element
  for (const rootKey in data) {
    data[rootKey].forEach((value) => {
      if (!reverseIndex[value]) {
        reverseIndex[value] = new Set();
      }
      reverseIndex[value].add(rootKey);
    });
  }

  return Object.entries(reverseIndex).reduce(
    (acc, [field, indexSet]) => {
      if (indexSet.size > 1) {
        acc[field] = Array.from(indexSet).map((x) => ({
          index: x,
          field: field,
        }));
      }
      return acc;
    },
    {} as Record<string, Array<IndexAndField>>,
  );
};

const getSharedFilters = async (
  indices: string,
  outpath: string,
  url: string,
) => {
  try {
    const data = await fetch(`${url}/guppy/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `{ _mapping { ${indices} }}`,
        variables: {},
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        throw error;
      });
    if ('_mapping' in data.data) {
      const sharedFiltersMap = groupSharedFields(data.data['_mapping']);
      const exported = JSON.stringify(sharedFiltersMap, null, '\t') + '\n';
      fs.writeFile(outpath, exported, 'utf8');
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.warn('Unable to get mapping data from guppy:', err);
    }
  }
};

interface SharedFiltersArgs extends Args {
  indices: string;
  out: string;
}

const { indices, out, url }: SharedFiltersArgs = getArgs({
  indices: '',
  out: './',
  url: 'https://localhost',
});

const main = async () => {
  await getSharedFilters(indices, out, url);
};
main();
