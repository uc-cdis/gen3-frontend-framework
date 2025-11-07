// Metadata Placeholder
const AddAuthMetaData = (data) => {
  return data[0].HEAL.map((item) => ({
    ...item,
    authMeta: {
      // Add any metadata as needed
      timestamp: Date.now(),
    },
  }));
};

export default AddAuthMetaData;
