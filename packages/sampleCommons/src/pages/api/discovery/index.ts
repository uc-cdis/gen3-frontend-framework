import addAuthMetaData from './processData/addAuthMetaData';
import combineData from './processData/combineData';
import filterData from './processData/filterData';
import paginateData from './processData/paginateData';
import searchData from './processData/searchData';
import sortData from './processData/sortData';

let cachedData = null;
let cacheTime = 0;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const mdsAggregateApi =
  'https://healdata.org/mds/aggregate/metadata?data=True&limit=2000&offset=0';
const mdsMetadataApi =
  'https://healdata.org/mds/metadata?data=True&_guid_type=unregistered_discovery_metadata&limit=2000&offset=0';

// Main Function to Orchestrate Steps
const processData = (data) => {
  const [searchQuery, pageNumber, pageSize] = [null, null, null];

  let processedData = addAuthMetaData(data); // Step 1: Add Metadata
  processedData = filterData(data); // Step 2: Filter
  processedData = searchData(data, searchQuery); // Step 3: Search
  processedData = sortData(data, 'title'); // Step 4: Sort (example key)
  const paginatedData = paginateData(processedData, pageSize, pageNumber); // Step 5: Pagination */
  return paginatedData;
};

export default async function handler(req: any, res: any) {
  const currentTime = Date.now();
  // Check if cached data is still valid
  if (cachedData && currentTime - cacheTime < CACHE_DURATION) {
    const processedData = processData(cachedData);
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
    const processedData = processData(combinedData);
    res.status(200).json(processedData);
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch data.' });
  }
}
