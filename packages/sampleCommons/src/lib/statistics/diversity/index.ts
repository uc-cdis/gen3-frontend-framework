import type { NextApiRequest, NextApiResponse } from 'next';
import { isArray } from 'lodash';
import { getDiversityData } from './data/data';

const handleError = (error: unknown, dataset?: string) => {
  let statusCode = 500;
  let message = 'a error has occurred';
  if (error instanceof Error) {
    statusCode = 404;
    message = `${dataset} does not exist in the library`;
  }
  return {
    statusCode,
    message,
  };
};

export default async function (req: NextApiRequest, res: NextApiResponse) {
  const { dataset: rawDataset } = req.query;
  const dataset =
    isArray(rawDataset) && rawDataset.length === 1 ? rawDataset[0] : undefined;

  if (req.method === 'GET') {
    if (dataset) {
      try {
        if (dataset === 'census') {
          return res.status(200).json(getDiversityData()['census']);
        }
        if (dataset === 'MIDRC') {
          return res.status(200).json(getDiversityData()['census']);
        }
      } catch (error: unknown) {
        const { statusCode, message } = handleError(error, dataset);
        res
          .status(statusCode)
          .json({ error: `error getting list: ${message}` });
      }
    }
  }
}
