



/**
 * Handles downloading of a Blob object as a file.
 *
 * @param {Blob} data - The Blob object to be downloaded.
 * @param {string} filename - The name of the file to be saved.
 */
export const handleDownload = (data: Blob, filename: string) => {
  const aElement = document.createElement('a');
  const href = URL.createObjectURL(data);
  aElement.setAttribute('download', filename);
  aElement.href = href;
  aElement.setAttribute('target', '_blank');
  aElement.click();
  URL.revokeObjectURL(href);
};

/* handle a join across two elasticises indices
 * The data index is the index that contains the data that we want to join to the resource index to
 * obtain the ID of the resource
 * for example there is a file index containing the file data for each case, and a case index containing
  the case data. We want to join the file index to the case index to get the case ID for each file in the file index
 */
interface DataIDToFileObjectID {
  dataIndex: string; // data index
  resourceIndex: string; // resource index to join to
  dataIdField: string; // name of the ID field in the data index
  resourceIdField: string; // name of the ID field in the resource index
  dataIdFieldInResourceIndex: string; // name of the data ID field in the resource index
  resourceFieldInDataIndex: string; // name of the resource field in the data index
}
