// Paginate Results
const paginateData = (data, pageSize, pageNumber) => {
  const start = (pageNumber - 1) * pageSize;
  // return data.slice(start, start + pageSize);
  return data;
};

export default paginateData;
