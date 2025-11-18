import _ from 'lodash';

// Sort Results
const sortData = (data, sorting) => {
  console.log('sorting', sorting);
  if (sorting.length === 0) return data;
  const sortingObject = sorting[0];
  const sortedData = data.sort((a, b) => {
    const key = sortingObject.id; // Extract the key to sort by
    const order = sortingObject.desc ? -1 : 1; // Determine sorting order

    const aValue = _.get(a, key, '').toString().toLowerCase(); // Use lodash to get the value
    const bValue = _.get(b, key, '').toString().toLowerCase(); // Use lodash to get the value

    if (aValue < bValue) {
      return 1 * order; // Reverse order
    }
    if (aValue > bValue) {
      return -1 * order; // Reverse order
    }
    return 0; // Equal values
  });
  return sortedData;
};

export default sortData;
