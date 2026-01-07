import { JSONObject } from '@gen3/core';

// Paginate Results
const paginateData = (
  data: Array<JSONObject>,
  pageSize: number,
  offset: number,
) => {
  console.log('paginateData pageSize: ', pageSize, 'offset: ', offset);
  const start = offset * pageSize;
  return data.slice(start, start + pageSize);
};
export default paginateData;
