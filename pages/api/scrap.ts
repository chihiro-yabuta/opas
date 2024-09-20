import { RedisClientType } from 'redis';
import { connect, Page, ElementHandle } from 'puppeteer-core';

export async function scrap(cli: RedisClientType, reqRegion: string, reqGenre: string) {
  const key = `opas?region=${reqRegion}&genre=${reqGenre}`;
  await cli.set(key, JSON.stringify({ log: 'start' }));

  try {
    const resObj: Response = {};
    const browser = await connect({
      browserWSEndpoint: `wss://chrome.browserless.io?token=${process.env.token}`,
    });
    const page = await browser.newPage();
    await page.goto('https://reserve.opas.jp/portal/menu/DantaiSelect.cgi?action=ReNew');

    const regions = await page.$$('td');
    const regionNames = await Promise.all(regions.map(async g => await imgName(g)));
    const regionIdx = regionNames.indexOf(reqRegion);
    await click(cli, key, page, regions[regionIdx], `region: ${regionNames[regionIdx]}`);

    const vacant = await (await page.$('.btnbox')).$('a');
    await click(cli, key, page, vacant, 'vacant');
    const purpose = await page.$('[onmouseover]');
    await click(cli, key, page, purpose, 'purpose');

    const genres = await page.$$('[onmouseover]');
    const genreNames = await Promise.all(genres.map(async g => await tdName(g)));
    const genreIdx = genreNames.indexOf(reqGenre);
    await click(cli, key, page, genres[genreIdx], `genre: ${genreNames[genreIdx]}`);

    for (let subGenreIdx = 0; subGenreIdx < (await page.$$('[onmouseover]')).length; subGenreIdx++) {
      const subGenres = await page.$$('[onmouseover]');
      const subGenreName = await name(subGenres[subGenreIdx]);
      await click(cli, key, page, subGenres[subGenreIdx], `subGenre: ${subGenreName}`);

      const select = await page.$('.btncenter > a');
      await click(cli, key, page, select, 'select');

      const next = (await page.$$('#pagerbox > a'))[1];
      await click(cli, key, page, next, 'next');

      const year = await lastOpt(await page.$('#optYear'));
      const month = await lastOpt(await page.$('#optMonth'));

      for (let weekIdx = 0; weekIdx < getWeekNumber(year, month); weekIdx++) {
        const day = (await page.$$('th > .day')).slice(0, 7);
        const week = await Promise.all(day.map(async d => await name(d)));

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

          const data = await Promise.all((await tbl.$$('tr')).map(async (row, rowIdx) => (
            await Promise.all((await row.$$('td img')).map(async (img, imgIdx) => {
              if ((await img.evaluate(e => e.getAttribute('src'))).includes('maru')) {
                return [subOrgs[rowIdx], `${week[imgIdx]} | ${await name(await row.$('.facmdstime'))}`];
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
        await click(cli, key, page, nextWeek, `nextWeek ${weekIdx}`);
      }
    }

    await cli.set(key, JSON.stringify(resObj));
  } catch (error) {
    console.log(error);
    await cli.del(key);
  }
}

async function click(cli: RedisClientType, key: string, page: Page, element: ElementHandle, title: string) {
  await element.click();
  await page.waitForNavigation({ waitUntil: 'networkidle0' });
  await cli.set(key, JSON.stringify({ log: title }));
  console.log(title);
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

async function lastOpt(element: ElementHandle) {
  const opts = await element.$$('option');
  return await opts[opts.length - 1].evaluate(e => e.getAttribute('value'));
}

function getWeekNumber(year: string, month: string) {
  const curr = new Date().getTime();
  const last = new Date(Number(year), Number(month), 0).getTime();
  return Math.ceil((Math.floor((last - curr) / (1000 * 60 * 60 * 24))) / 7);
}

interface Response {
  [org: string]: {
    [subOrg: string]: {
      [subGenre: string]: string[];
    };
  };
}