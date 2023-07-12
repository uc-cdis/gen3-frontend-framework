import { NextApiRequest, NextApiResponse } from 'next';
import { getNavPageLayoutPropsFromConfig } from '../../../lib/common/staticProps';

export default async function (req: NextApiRequest, res: NextApiResponse) {
  const content = await getNavPageLayoutPropsFromConfig();
  return res.status(200).json({
    content,
  });
}
