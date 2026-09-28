export const MAX_NUMBER_OF_ITEMS_IN_LIST = 200;

type FileInfo = Record<string, string | number>;
export type sourceFieldData = string | FileInfo[];

export type processedDatumForDataDownloadList = {
  title: string;
  guid: string;
};

export const ProcessData = (sourceFieldData: sourceFieldData) => {
  if (!Array.isArray(sourceFieldData)) {
    return {
      processedDataForDataDownloadList: [],
      dataForDataDownloadListHasBeenTruncated: false,
    };
  }
  const dataWithOnlyTitlesOrFileNames = sourceFieldData.filter(
    (item: FileInfo) => {
      if (!('title' in item || 'file_name' in item)) {
      }
      return 'title' in item || 'file_name' in item;
    },
  );
  let processedDataForDataDownloadList = dataWithOnlyTitlesOrFileNames.map(
    (obj: FileInfo) => ({
      title: obj.title || obj.file_name,
      guid: obj.object_id,
    }),
  );
  let dataForDataDownloadListHasBeenTruncated = false;
  if (processedDataForDataDownloadList.length > MAX_NUMBER_OF_ITEMS_IN_LIST) {
    processedDataForDataDownloadList = processedDataForDataDownloadList.slice(
      0,
      MAX_NUMBER_OF_ITEMS_IN_LIST,
    );
    dataForDataDownloadListHasBeenTruncated = true;
  }
  let rootLevelFiles: any = [];
  let nonRootLevelFiles: any = [];
  processedDataForDataDownloadList.forEach((element) => {
    let titleParts: string[] = [];
    if (typeof element.title === 'string') {
      titleParts = element.title.split('/');
    }
    if (titleParts.length > 2) {
      nonRootLevelFiles.push(element);
    } else {
      rootLevelFiles.push(element);
    }
  });
  if (rootLevelFiles.length) {
    rootLevelFiles = rootLevelFiles.sort(
      (
        a: processedDatumForDataDownloadList,
        b: processedDatumForDataDownloadList,
      ) =>
        a.title.localeCompare(b.title, undefined, {
          numeric: true,
          sensitivity: 'base',
        }),
    );
  }
  if (nonRootLevelFiles.length) {
    nonRootLevelFiles = nonRootLevelFiles.sort((a: any, b: any) =>
      a.title.localeCompare(b.title, undefined, {
        numeric: true,
        sensitivity: 'base',
      }),
    );
  }
  processedDataForDataDownloadList = rootLevelFiles.concat(nonRootLevelFiles);
  return {
    processedDataForDataDownloadList,
    dataForDataDownloadListHasBeenTruncated,
  };
};
