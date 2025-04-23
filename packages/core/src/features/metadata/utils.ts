import Queue from 'queue';
import { GEN3_MDS_API } from '../../constants';
import { fetchJSONDataFromURL, HttpMethod } from '../../utils';

export const queryMultipleMDSRecords = async (
  guids: ReadonlyArray<string>,
  useAggMDS: boolean = false,
  signal?: AbortSignal,
): Promise<Record<string, unknown>> => {
  const result: Record<string, unknown> = {};
  const queue = Queue({ concurrency: 15 });
  for (const id of guids) {
    queue.push(async (callback?: () => void) => {
      try {
        result[id] = await fetchJSONDataFromURL(
          useAggMDS
            ? `${GEN3_MDS_API}/aggregate/metadata/guid/${id}`
            : `${GEN3_MDS_API}/metadata/${id}`,
          false,
          'GET' as HttpMethod,
          undefined,
          signal,
        );

        if (callback) callback();

        return result;
      } catch (e: unknown) {
        return { error: e };
      }
    });
  }

  return new Promise((resolve, reject) => {
    queue.start((err: unknown) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};
