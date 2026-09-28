import FileSaver from 'file-saver';
import { DataActionFunction } from '../types';
import { selectionToManifest } from '../utils';
import { MANIFEST_FILENAME } from '../../../../types/constants';

export const exportToManifest: DataActionFunction = async (
  validatedSelections,
  params,
  onDone = () => null,
  onError = () => null,
) => {
  const manifest = selectionToManifest(validatedSelections); // TODO md5sum? commons_name?
  try {
    const blob = new Blob([JSON.stringify(manifest, null, 2)], {
      type: 'text/json',
    });
    FileSaver.saveAs(blob, MANIFEST_FILENAME);
    onDone?.();
  } catch (error: unknown) {
    if (error instanceof Error) {
      onError?.(error);
    } else onError?.(new Error('unknown error saving file'));
  }
};
