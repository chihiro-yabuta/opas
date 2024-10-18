import { NextApiRequest, NextApiResponse } from 'next';
import { RedisClientType, createClient } from 'redis';
import { crawl } from './crawl';

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
  const resObj = JSON.parse(await cli.get(key));

  if (cond?.status === 'in-progress') {
    if (cond.key !== key) {
      return res.status(200).json(updt ? cond : resObj || { status: 'skip', key: key, msg: 'not yet' });
    } else {
      const time = new Date().getTime();
      if (Number(cond.msg) - time < 180000) {
        return res.status(200).json(cond);
      } else {
        await cli.set('opas', JSON.stringify({ status: 'error', key: key, msg: 'stuck' }));
        await cli.set(key, JSON.stringify({ status: 'error', key: key, msg: 'stuck' }));
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
      return res.status(200).json(resObj || { status: 'skip', key: key, msg: 'not yet' });
    }
  }
}