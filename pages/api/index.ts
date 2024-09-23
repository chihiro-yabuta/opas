import { mkdir, writeFile } from 'fs/promises';
import { NextApiRequest, NextApiResponse } from 'next';
import { RedisClientType, createClient } from 'redis';
import { scrap } from './scrap';

let cli: RedisClientType;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { searchParams } = new URL(req.url as string, `http://${req.headers.host}`);
  const updt = searchParams.get('updt');
  const reqRegion = searchParams.get('region');
  const reqGenre = searchParams.get('genre');

  if (!cli) {
    cli = createClient(!process.env.test && {
      url: 'rediss://' + process.env.host,
      password: process.env.pswd,
      socket: { tls: true, minVersion: 'TLSv1.2' }
    });
    await cli.connect();
  }

  let resObj = JSON.parse(await cli.get(`opas?region=${reqRegion}&genre=${reqGenre}`));
  if (!resObj || (updt && !resObj.log)) {
    process.env.test && await mkdir('log', { recursive: true });
    process.env.test && await writeFile(`log/${reqRegion}${reqGenre}.log`, '');
    await cli.set(`opas?region=${reqRegion}&genre=${reqGenre}`, JSON.stringify({ log: 'start' }));

    scrap(cli, reqRegion, reqGenre);
    return res.status(200).json({ log: 'start' });
  }
  return res.status(200).json(resObj);
}