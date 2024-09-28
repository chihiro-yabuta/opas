import fs from 'fs';
import { mkdir, writeFile } from 'fs/promises';
import https from 'https';
import { NextApiRequest, NextApiResponse } from 'next';
import { RedisClientType, createClient } from 'redis';
import AdmZip from 'adm-zip';
import { scrape } from './scrape';

let cli: RedisClientType;
const url = 'https://download-chromium.appspot.com/dl/Linux?type=snapshots';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (!fs.existsSync('/tmp/chromium.zip')) {
      await new Promise((resolve, reject) => https.get(url,
        (res) => https.get(res.headers.location, (r) => {
          const writableStream = fs.createWriteStream('/tmp/chromium.zip');
          r.pipe(writableStream);
          r.on('end', resolve);
          r.on('error', reject);
        })
      ));

      const zip = new AdmZip('/tmp/chromium.zip');
      zip.extractAllTo('/tmp', true);
    }
  } catch (error) {
    return res.status(200).json({ zipExists: fs.existsSync('/tmp/chromium.zip'), error: error });
  }

  const { searchParams } = new URL(req.url as string, `http://${req.headers.host}`);
  const updt = searchParams.get('updt');
  const reqRegion = searchParams.get('region');
  const reqGenre = searchParams.get('genre');

  if (!cli) {
    cli = createClient(process.env.VERCEL && {
      url: 'rediss://' + process.env.host,
      password: process.env.pswd,
      socket: { tls: true, minVersion: 'TLSv1.2' }
    });
    await cli.connect();
  }

  const key = `opas?region=${reqRegion}&genre=${reqGenre}`;
  const cond = JSON.parse(await cli.get('opas'));
  const resObj = JSON.parse(await cli.get(key));

  if (cond?.status === 'in-progress') {
    return res.status(200).json(resObj ? resObj : cond);
  } else {
    if (!resObj || updt) {
      await cli.set('opas', JSON.stringify({ status: 'in-progress', key: key }));

      !process.env.VERCEL && await mkdir('log', { recursive: true });
      !process.env.VERCEL && await writeFile(`log/${reqRegion}${reqGenre}.log`, '');

      scrape(cli, reqRegion, reqGenre);
      return res.status(200).json({ status: 'in-progress', key: key });
    } else {
      return res.status(200).json(resObj);
    }
  }
}