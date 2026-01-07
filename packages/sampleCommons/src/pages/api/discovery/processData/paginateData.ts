import { JSONObject } from '@gen3/core';

// Paginate Results
const paginateData = (
  data: Array<JSONObject>,
  pageSize: number,
  offset: number,
) => {
  console.log('paginateData pageSize: ', pageSize, 'offset: ', offset);
  // const start = offset;
  return data.slice(offset, offset + pageSize);
};
export default paginateData;
