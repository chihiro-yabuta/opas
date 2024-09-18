import { NextApiRequest, NextApiResponse } from 'next';
import { connect, Page, ElementHandle } from 'puppeteer-core';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const browser = await connect({
    browserWSEndpoint: `wss://chrome.browserless.io?token=${process.env.token}`,
  });
  const { searchParams } = new URL(
    req.url as string,
    `http://${req.headers.host}`
  );
  const reqGenre = searchParams.get('genre');
  const page = await browser.newPage();

  let cnt = 0;
  while (1) {
    await page.goto('https://reserve.opas.jp/portal/menu/DantaiSelect.cgi?action=ReNew');
    const regions = await page.$$('td');
    if (cnt === 1) {//regions.length) {
      break;
    }

    const region = regions[cnt];
    await click(page, region);
    const vacant = await (await page.$('.btnbox')).$('a');
    await click(page, vacant);
    const purpose = await page.$('[onmouseover]');
    await click(page, purpose);

    for (let i = 0; i < (await page.$$('[onmouseover]')).length; i++) {
      const genres = await page.$$('[onmouseover]');
      const genreName = await tdName(genres[i]);

      if (genreName === reqGenre) { //delete
        await click(page, genres[i]);

        for (let i = 0; i < (await page.$$('[onmouseover]')).length; i++) {
          const subGenres = await page.$$('[onmouseover]');
          await click(page, subGenres[i]);

          const select = await page.$('.btncenter > a');
          await click(page, select);

          const next = (await page.$$('#pagerbox > a'))[1];
          await click(page, next);

          const undo1 = await page.$('#pagerbox > a');
          await click(page, undo1);
          const undo2 = await page.$('#pagerbox > a');
          await click(page, undo2);
        }

        const undo = await page.$('#pagerbox > a');
        await click(page, undo);
      }
    }

    cnt++;
  }

  return res.status(200).send('hello');
}

async function click(page: Page, element: ElementHandle) {
  await element.click();
  await page.waitForNavigation({ waitUntil: 'networkidle0' });
}

async function tdName(element: ElementHandle) {
  return await element.evaluate(e => e.querySelector('td').textContent.trim());
}