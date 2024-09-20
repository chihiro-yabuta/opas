import { NextApiRequest, NextApiResponse } from 'next';
import { RedisClientType, createClient } from 'redis';
import { scrap } from './scrap';

let cli: RedisClientType;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { searchParams } = new URL(
    req.url as string,
    `http://${req.headers.host}`
  );
  const env = searchParams.get('env');
  const updt = searchParams.get('updt');
  const reqRegion = searchParams.get('region');
  const reqGenre = searchParams.get('genre');

  if (!cli) {
    cli = createClient(!env && {
      url: 'rediss://' + process.env.host,
      password: process.env.pswd,
      socket: {
        tls: true,
        minVersion: 'TLSv1.2'
      }
    });
    await cli.connect();
  }
  const key = `opas?region=${reqRegion}&genre=${reqGenre}`;

  let resObj = JSON.parse(await cli.get(key));
  if (!resObj || (updt && !resObj.log)) {
    scrap(cli, reqRegion, reqGenre);
    return res.status(200).json({ log: 'init' });
  }
  return res.status(200).json(resObj);
}