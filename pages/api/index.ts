import { NextApiRequest, NextApiResponse } from 'next';
import { RedisClientType, createClient } from 'redis';
import { crawl } from './crawl';
import { Response } from './data';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { searchParams } = new URL(req.url as string, `http://${req.headers.host}`);
  const updt = searchParams.get('updt');
  const reqRegions = searchParams.getAll('region');
  const reqGenre = searchParams.get('genre');
  const prod = process.env.NODE_ENV === 'production';

  const cli: RedisClientType = createClient(prod && {
    url: process.env.host,
  });
  await cli.connect();

  const key = `opas?genre=${reqGenre}`;
  const fullKey = `${key}&region=${reqRegions.join('&region=')}`
  const cond = JSON.parse(await cli.get('opas'));
  const resObj: Response = {};

  if (cond?.status === 'in-progress') {
    const time = new Date().getTime();
    if (Number(cond.msg) - time < 300000) {
      if (updt) {
        await cli.disconnect();
        return res.status(200).json(cond);
      } else {
        await Promise.all(reqRegions.map(async (e) => {
          resObj[e] = JSON.parse(await cli.get(`${key}&region=${e}`));
        }));
        await cli.disconnect();
        return res.status(200).json(resObj);
      }
    } else {
      await cli.disconnect();
      await cli.set('opas', JSON.stringify({ status: 'error', key: key, msg: 'stuck' }));
      return res.status(200).json({ status: 'error', key: key, msg: 'stuck' });
    }
  } else {
    if (updt === 'updt') {
      const time = new Date().getTime().toString();
      await cli.set('opas', JSON.stringify({ status: 'in-progress', key: fullKey, msg: time }));
      crawl(cli, reqRegions, reqGenre, key);
      return res.status(200).json({ status: 'in-progress', key: fullKey, msg: time });
    } else {
      await Promise.all(reqRegions.map(async (e) => {
        resObj[e] = JSON.parse(await cli.get(`${key}&region=${e}`));
      }));
      await cli.disconnect();
      return res.status(200).json(resObj);
    }
  }
}