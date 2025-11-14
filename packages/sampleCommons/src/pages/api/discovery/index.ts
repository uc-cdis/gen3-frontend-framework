import addAuthMetaData from './preProcessData/addAuthMetaData';
import combineData from './preProcessData/combineData';
import filterData from './processData/filterData';
import paginateData from './processData/paginateData';
import searchData from './processData/searchData';
import sortData from './processData/sortData';
import { JSONObject } from '@gen3/core';

let cachedData: Array<JSONObject> = [];
let cacheTime = 0;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const mdsAggregateApi =
  'https://healdata.org/mds/aggregate/metadata?data=True&limit=2000&offset=0';
const mdsMetadataApi =
  'https://healdata.org/mds/metadata?data=True&_guid_type=unregistered_discovery_metadata&limit=2000&offset=0';

// Main Function to Orchestrate Steps
const processData = (data: Array<JSONObject>, reqBody: any) => {
  const { pagination, searchTerms, sorting, filters } = reqBody;
  let processedData: Array<JSONObject>;
  processedData = addAuthMetaData(data); // Step 1: Add Metadata
  processedData = filterData(data); // Step 2: Filter
  processedData = searchData(data, searchTerms); // Step 3: Search
  processedData = sortData(data, 'title'); // Step 4: Sort (example key)
  const paginatedData = paginateData(
    processedData,
    pagination.pageSize,
    pagination.offset,
  ); // Step 5: Pagination */
  return paginatedData;
  // return processedData;
};

export default async function handler(req: any, res: any) {
  console.log('req', req.body);
  const currentTime = Date.now();
  // Check if cached data is still valid
  if (cachedData && currentTime - cacheTime < CACHE_DURATION) {
    const processedData = processData(cachedData, req.body);
    res.status(200).json(processedData);
  }

  try {
    // Fetch both APIs concurrently
    const [mdsAggregateResponse, mdsMetadataResponse] = await Promise.all([
      fetch(mdsAggregateApi),
      fetch(mdsMetadataApi),
    ]);

    // Check if both responses are OK
    if (!mdsAggregateResponse.ok || !mdsMetadataResponse.ok) {
      throw new Error('One of the responses was not ok.');
    }

    // Parse the JSON data from both responses
    const mdsAggregateData = await mdsAggregateResponse.json();
    const mdsMetadataData = await mdsMetadataResponse.json();
    const combinedData = combineData(mdsAggregateData, mdsMetadataData);
    // Update the cache
    cachedData = combinedData;
    cacheTime = currentTime;
    console.log('req.body', req.body);
    const processedData = processData(combinedData, req.body);
    res.status(200).json(processedData);
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch data.' });
  }
}
