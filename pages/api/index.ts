import { NextApiRequest, NextApiResponse } from 'next';
import { scrap } from './scrap';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { searchParams } = new URL(
    req.url as string,
    `http://${req.headers.host}`
  );
  const reqRegion = searchParams.get('region');
  const reqGenre = searchParams.get('genre');

  const resObj = await scrap(reqRegion, reqGenre);

  return res.status(200).json(resObj);
}