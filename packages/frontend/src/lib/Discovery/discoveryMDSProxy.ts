import type { NextApiRequest, NextApiResponse } from 'next';
import type { JSONObject } from '@gen3/core/server';
import { GEN3_MDS_API } from '@gen3/core/server';
import {
  filterByAccessLevels,
  filterByAdvSearch,
  filterByTags,
  paginateData,
  processTagCategoryData,
  searchData,
  sortData,
} from '../../features/Discovery/DataLoaders/processData';
import { combineData } from '../../features/Discovery/DataLoaders/preProcessData';
import addAccessLevelsMetaData from './addAccessLevelsMetaData';

let cachedData: Array<JSONObject> = [];
let cacheTime = 0;
const CACHE_DURATION = 0.25 * 60 * 60 * 1000; // 15 minutes in milliseconds
const mdsAggregateApi = `${GEN3_MDS_API}/aggregate/metadata?data=True&limit=2000&offset=0`;
const mdsMetadataApi = `${GEN3_MDS_API}/metadata?data=True&_guid_type=unregistered_discovery_metadata&limit=2000&offset=0`;

// Main Function to Orchestrate Steps
const processData = async (
  data: Array<JSONObject>,
  reqBody: NextApiRequest['body'],
  cookies: string | undefined,
) => {
  const {
    pagination,
    searchTerms,
    sorting,
    selectedTags,
    selectedFieldsForSearchIndexing,
    searchMode,
    selectedAccessLevels,
    discoveryConfig,
  } = reqBody;
  const preprocessedData = await addAccessLevelsMetaData(data, cookies);
  let processedData: Array<JSONObject> = preprocessedData;
  // Study access levels filtering (user selected data availability)
  processedData = filterByAccessLevels(processedData, selectedAccessLevels);
  // Then: Search
  processedData = searchData(
    processedData,
    searchTerms.keyword.keywords,
    selectedFieldsForSearchIndexing,
    searchMode,
    discoveryConfig,
  );
  // Then Adv Search Filtering (user selected filters)
  processedData = filterByAdvSearch(
    processedData,
    searchTerms.advancedSearchTerms,
    discoveryConfig,
  );
  // Next: Filter by Tags
  processedData = filterByTags(processedData, selectedTags, discoveryConfig);
  // Then: Sort columns
  processedData = sortData(processedData, sorting);
  // Finally: Pagination
  const paginatedData = paginateData(
    processedData,
    pagination.pageSize,
    pagination.offset,
  );
  return {
    hits: processedData.length,
    displayedData: paginatedData,
    suggestions: [],
    tagCategoryData: processTagCategoryData(data, discoveryConfig),
  };
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const cookies = req.headers.cookie || '';
  const currentTime = Date.now();
  // Check if cached data is still valid
  if (cachedData.length > 0 && currentTime - cacheTime < CACHE_DURATION) {
    const processedData = await processData(cachedData, req.body, cookies);
    res.status(200).json(processedData);
  } else {
    try {
      // Fetch both APIs concurrently
      const [mdsAggregateResponse, mdsMetadataResponse] = await Promise.all([
        fetch(mdsAggregateApi),
        fetch(mdsMetadataApi),
      ]);
      // Check if both responses are OK
      if (!mdsAggregateResponse.ok || !mdsMetadataResponse.ok) {
        throw new Error(
          `One of the responses was not ok: mdsAggregateResponse ${mdsAggregateResponse.status} ${mdsAggregateResponse.statusText}, mdsMetadataResponse ${mdsMetadataResponse.status} ${mdsMetadataResponse.statusText}`,
        );
      }
      // Parse the JSON data from both responses
      const mdsAggregateData = await mdsAggregateResponse.json();
      const mdsMetadataData = await mdsMetadataResponse.json();
      const combinedData = combineData(mdsAggregateData, mdsMetadataData);
      // Update the cache
      cachedData = combinedData;
      cacheTime = currentTime;
      const processedData = await processData(combinedData, req.body, cookies);
      res.status(200).json(processedData);
    } catch (error) {
      console.error('Fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch data.' });
    }
  }
}
