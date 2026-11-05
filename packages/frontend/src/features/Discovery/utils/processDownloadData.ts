const ProcessData = (sourceFieldData: any) => {
  const dataWithOnlyTitlesOrFileNames = sourceFieldData[0].filter(
    (item: any) => {
      if (!('title' in item || 'file_name' in item)) {
      }
      return 'title' in item || 'file_name' in item;
    },
  );

  return dataWithOnlyTitlesOrFileNames.map((obj: any) => ({
    title: obj.title || obj.file_name,
    description: obj.description,
  }));
};

export default ProcessData;
