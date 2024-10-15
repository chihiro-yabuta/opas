import { NextApiRequest, NextApiResponse } from 'next';
import { crawl } from './crawl';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { searchParams } = new URL(req.url as string, `http://${req.headers.host}`);
  const reqGenre = searchParams.get('genre');
  const obj = await crawl(reqGenre);
  res.status(200).json(obj);
}