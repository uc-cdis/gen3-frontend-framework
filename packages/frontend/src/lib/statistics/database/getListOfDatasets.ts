import type { NextApiRequest, NextApiResponse } from 'next';
import database from './dataRepository';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const data = await database.getData('/');

    if (data && typeof data === 'object') {
      const results = Object.keys(data).reduce(
        (acc, key) => {
          if (data[key] && typeof data[key] === 'object') {
            acc[key] = Object.keys(data[key]);
          } else {
            acc[key] = [];
          }
          return acc;
        },
        {} as Record<string, Array<string>>,
      );

      res.status(200).json(results);
    } else {
      res.status(404).json({ message: 'No data found' });
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export default handler;
