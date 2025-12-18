import { JSONObject } from '@gen3/core/dist';
import _ from 'lodash';

const sortData = (
  data: Array<JSONObject>,
  sorting: Array<{ id: string; desc: string }>,
) => {
  // if there's no sorting array return the unsorted data
  if (sorting.length === 0) return data;
  const sortingObject = sorting[0];
  const sortedData = data.sort((a, b) => {
    const key = sortingObject.id; // Extract the key to sort by
    const order = sortingObject.desc ? -1 : 1; // Determine sorting order
    // Use lodash to get nested objects via dot notation,
    // e.g. study_metadata.minimal_info.study_name
    const aValue = _.get(a, key, '')?.toString().toLowerCase();
    const bValue = _.get(b, key, '')?.toString().toLowerCase();
    if ((aValue as string) < (bValue as string)) {
      return 1 * order;
    }
    if ((aValue as string) > (bValue as string)) {
      return -1 * order;
    }
    return 0; // Equal values
  });
  return sortedData;
};

export default sortData;
