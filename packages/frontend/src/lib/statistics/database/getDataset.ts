import type { NextApiRequest, NextApiResponse } from 'next';
import database from './dataRepository';
import { DataError } from 'node-json-db';
import { isArray } from 'lodash';

const handleError = (error: unknown, id?: string) => {
  let statusCode = 500;
  let message = 'An error has occurred';

  if (error instanceof DataError) {
    if (error.id === 5) {
      statusCode = 404;
      message = `${id} does not exist in the library`;
    }
  }

  // Log detailed error for debugging purposes
  console.error('Error details:', error);

  return {
    statusCode,
    message,
  };
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // Extract and validate query parameters
  const rawId = req.query.name;

  const id = isArray(rawId) && rawId.length === 1 ? rawId[0] : rawId;

  if (req.method === 'GET') {
    if (id) {
      try {
        // Use of `const` as `dataset` should not be reassigned
        const dataset = await database.getData(`/${id}`);
        res.status(200).json({
          data: {
            dataset,
          },
        });
      } catch (error: unknown) {
        const { statusCode, message } = handleError(error, id as string);
        res
          .status(statusCode)
          .json({ error: `Error getting list: ${message}` });
      }
    } else {
      res.status(400).json({ error: 'Bad id' });
    }
  } else {
    // Return 405 for unsupported HTTP methods
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

export default handler;
