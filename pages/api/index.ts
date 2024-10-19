import { NextApiRequest, NextApiResponse } from 'next';
import { RedisClientType, createClient } from 'redis';
import { crawl } from './crawl';
import { Response, regions } from './data';

let cli: RedisClientType;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { searchParams } = new URL(req.url as string, `http://${req.headers.host}`);
  const updt = searchParams.get('updt');
  const reqGenre = searchParams.get('genre');
  const prod = process.env.NODE_ENV === 'production';

  if (!cli) {
    cli = createClient(prod && {
      url: 'rediss://' + process.env.host,
      password: process.env.pswd,
      socket: { tls: true, minVersion: 'TLSv1.2' }
    });
    await cli.connect();
  }

  const key = `opas?genre=${reqGenre}`;
  const cond = JSON.parse(await cli.get('opas'));
  const resObj: Response = {};

  if (cond?.status === 'in-progress') {
    if (cond.key !== key) {
      if (updt) {
        return res.status(200).json(cond);
      } else {
        await Promise.all(Object.values(regions).map(async (v) => {
          resObj[v[1]] = JSON.parse(await cli.get(`${key}&region=${v[1]}`));
        }));
        return res.status(200).json(resObj);
      }
    } else {
      const time = new Date().getTime();
      if (Number(cond.msg) - time < 300000) {
        return res.status(200).json(cond);
      } else {
        await cli.set('opas', JSON.stringify({ status: 'error', key: key, msg: 'stuck' }));
        return res.status(200).json({ status: 'error', key: key, msg: 'stuck' });
      }
    }
  } else {
    if (updt) {
      const time = new Date().getTime().toString();
      await cli.set('opas', JSON.stringify({ status: 'in-progress', key: key, msg: time }));
      crawl(cli, reqGenre, key);
      return res.status(200).json({ status: 'in-progress', key: key, msg: time });
    } else {
      await Promise.all(Object.values(regions).map(async (v) => {
        resObj[v[1]] = JSON.parse(await cli.get(`${key}&region=${v[1]}`));
      }));
      return res.status(200).json(resObj);
    }
  }
}