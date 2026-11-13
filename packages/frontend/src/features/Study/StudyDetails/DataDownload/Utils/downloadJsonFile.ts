import { saveAs } from 'file-saver';

export const downloadJsonFile = (fileName: string, data: unknown): void => {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'text/json',
  });
  saveAs(blob, fileName);
};
