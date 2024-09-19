import { connect, Page, ElementHandle } from 'puppeteer-core';

export async function scrap(reqRegion: string, reqGenre: string) {
  const browser = await connect({
    browserWSEndpoint: `wss://chrome.browserless.io?token=${process.env.token}`,
  });
  const page = await browser.newPage();
  const resObj: Response = {};

  await page.goto('https://reserve.opas.jp/portal/menu/DantaiSelect.cgi?action=ReNew');
  const regions = await page.$$('td');

  const regionNames = await Promise.all(regions.map(async g => await imgName(g)));
  const regionIdx = regionNames.indexOf(reqRegion);
  await click(page, regions[regionIdx], `region: ${regionNames[regionIdx]}`);

  const vacant = await (await page.$('.btnbox')).$('a');
  await click(page, vacant, 'vacant');
  const purpose = await page.$('[onmouseover]');
  await click(page, purpose, 'purpose');

  const genres = await page.$$('[onmouseover]');
  const genreNames = await Promise.all(genres.map(async g => await tdName(g)));
  const genreIdx = genreNames.indexOf(reqGenre);

  await click(page, genres[genreIdx], `genre: ${genreNames[genreIdx]}`);

  for (let i = 0; i < (await page.$$('[onmouseover]')).length; i++) {
    const subGenres = await page.$$('[onmouseover]');
    const subGenreName = await name(subGenres[i]);
    await click(page, subGenres[i], `subGenre: ${subGenreName}`);

    const select = await page.$('.btncenter > a');
    await click(page, select, 'select');

    const next = (await page.$$('#pagerbox > a'))[1];
    await click(page, next, 'next');

    let weekCnt = 0;
    while (1) {
      if (weekCnt === 2) { //solve
        break;
      }
      const day = (await page.$$('th > .day')).slice(0, 7);
      const week = await Promise.all(day.map(async e => await name(e)));

      for (const tbl of await page.$$('#facilitiesbox > tbody > tr > td')) {
        const org = await name(await tbl.$('.clearfix.kaikan_title'));
        let subOrgs = await Promise.all((await tbl.$$('tr')).map(async (row) => {
          const subOrg = await row.$('.shisetu_name > .clearfix');
          return subOrg && await name(subOrg);
        }));

        let subOrg = null;
        subOrgs = subOrgs.map((s) => {
          subOrg = s || subOrg;
          return subOrg;
        });

        const data = await Promise.all((await tbl.$$('tr')).map(async (row, n) => (
          await Promise.all((await row.$$('td img')).map(async (img, i) => {
            if ((await img.evaluate(e => e.getAttribute('src'))).includes('maru')) {
              return [subOrgs[n], `${week[i]} | ${await name(await row.$('.facmdstime'))}`];
            }
          }))
        )));

        data.map(d => (d.map((e) => {
          if (e) {
            if (!resObj[org]) {
              resObj[org] = {};
            }
            if (!resObj[org][e[0]]) {
              resObj[org][e[0]] = {};
            }
            if (!resObj[org][e[0]][subGenreName]) {
              resObj[org][e[0]][subGenreName] = [];
            }
            resObj[org][e[0]][subGenreName].push(e[1]);
          }
        })));
      }

      const nextWeek = (await page.$$('.wmmove > a'))[1];
      await click(page, nextWeek, `nextWeek ${weekCnt}`);
      weekCnt++;
    }
  }

  return resObj;
}

async function click(page: Page, element: ElementHandle, title: string) {
  await element.click();
  console.log(`done: ${title}`);
  await page.waitForNavigation({ waitUntil: 'networkidle0' });
}

async function name(element: ElementHandle) {
  return await element.evaluate(e => e.textContent.trim());
}

async function imgName(element: ElementHandle) {
  return await (await element.$('img')).evaluate(e => e.getAttribute('title').split('ボタン')[0]);
}

async function tdName(element: ElementHandle) {
  return await element.evaluate(e => e.querySelector('td').textContent.trim());
}

interface Response {
  [org: string]: {
    [subOrg: string]: {
      [subGenre: string]: string[];
    };
  };
}