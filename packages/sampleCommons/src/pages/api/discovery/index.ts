import { JSONObject } from '@gen3/core';
import filterByTags from '@/utils/api/discovery/processData/filterByTags';
import paginateData from '@/utils/api/discovery/processData/paginateData';
import searchData from '@/utils/api/discovery/processData/searchData';
import sortData from '@/utils/api/discovery/processData/sortData';
import filterByAdvSearch from '@/utils/api/discovery/processData/filterByAdvSearch';
import combineData from '@/utils/api/discovery/preProcessData/combineData';
// TODO:
// import addAuthMetaData from '@/utils/api/discovery/preProcessData/addAuthMetaData';

let cachedData: Array<JSONObject> = [];
let cacheTime = 0;
const CACHE_DURATION = 0.25 * 60 * 60 * 1000; // 15 minutes in milliseconds
const mdsAggregateApi =
  'https://healdata.org/mds/aggregate/metadata?data=True&limit=2000&offset=0';
const mdsMetadataApi =
  'https://healdata.org/mds/metadata?data=True&_guid_type=unregistered_discovery_metadata&limit=2000&offset=0';

// Main Function to Orchestrate Steps
const processData = (data: Array<JSONObject>, reqBody: any) => {
  const {
    pagination,
    searchTerms,
    sorting,
    selectedTags,
    selectedFieldsForSearchIndexing,
    discoveryConfig,
  } = reqBody;
  let processedData: Array<JSONObject> = data;
  // First: Search
  processedData = searchData(
    data,
    searchTerms.keyword.keywords,
    selectedFieldsForSearchIndexing,
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
  };
};

export default async function handler(req: any, res: any) {
  const currentTime = Date.now();
  // Check if cached data is still valid
  if (cachedData && currentTime - cacheTime < CACHE_DURATION) {
    const processedData = processData(cachedData, req.body);
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
          `One of the responses was not ok:
        mdsAggregateResponse:${mdsAggregateResponse},
        mdsMetadataResponse ${mdsMetadataResponse}`,
        );
      }
      // Parse the JSON data from both responses
      const mdsAggregateData = await mdsAggregateResponse.json();
      const mdsMetadataData = await mdsMetadataResponse.json();
      const combinedData = combineData(mdsAggregateData, mdsMetadataData);
      // Update the cache
      cachedData = combinedData;
      cacheTime = currentTime;
      const processedData = processData(combinedData, req.body);
      res.status(200).json(processedData);
    } catch (error) {
      console.error('Fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch data.' });
    }
  }
}
