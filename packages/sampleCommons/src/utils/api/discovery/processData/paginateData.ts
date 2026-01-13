import { JSONObject } from '@gen3/core';

const paginateData = (
  data: Array<JSONObject>,
  pageSize: number,
  offset: number,
) => data.slice(offset, offset + pageSize);

export default paginateData;
