import { appendFile } from 'fs/promises';
import { RedisClientType } from 'redis';
import { Page, ElementHandle, connect } from 'puppeteer-core';

export async function scrap(res: Response, cli: RedisClientType, reqRegion: string, reqGenre: string, tgtSubgenre: number, tgtWeek: number) {
  let reqTgtSubgenre = 0;
  let reqTgtWeek = 0;
  const resObj = res;
  const logObj = (l: string): Log => { return { region: reqRegion, genre: reqGenre, log: l } };

  const browser = await connect({ browserWSEndpoint: `wss://chrome.browserless.io?token=${process.env.token}` });
  const page = await browser.newPage();

  try {
    await page.goto('https://reserve.opas.jp/portal/menu/DantaiSelect.cgi?action=ReNew');
    const regions = await page.$$('td');
    const regionNames = await Promise.all(regions.map(async g => await imgName(g)));
    const regionIdx = regionNames.indexOf(reqRegion);
    let msg = await click(page, regions[regionIdx], logObj(reqRegion));

    const vacant = await (await page.$('.btnbox')).$('a');
    msg = await click(page, vacant, logObj(`${msg}->vacant`));
    const purpose = await page.$('[onmouseover]');
    msg = await click(page, purpose, logObj(`${msg}->purpose`));

    const genres = await page.$$('[onmouseover]');
    const genreNames = await Promise.all(genres.map(async g => await tdName(g)));
    const genreIdx = genreNames.indexOf(reqGenre);
    msg = await click(page, genres[genreIdx], logObj(`${msg}->${genreNames[genreIdx]}`));

    for (let subGenreIdx = tgtSubgenre; subGenreIdx < (await page.$$('[onmouseover]')).length; subGenreIdx++) {
      reqTgtSubgenre = subGenreIdx;
      const subGenres = await page.$$('[onmouseover]');
      const subGenreName = await name(subGenres[subGenreIdx]);
      let m = await click(page, subGenres[subGenreIdx], logObj(`${msg}->${subGenreName}`));

      const select = await page.$('.btncenter > a');
      m = await click(page, select, logObj(`${m}->select`));

      const next = (await page.$$('#pagerbox > a'))[1];
      m = await click(page, next, logObj(`${m}->next`));

      let compareDate = '';
      let weekIdx = 0;
      while (1) {
        reqTgtWeek = weekIdx;
        const tbls = await page.$$('#facilitiesbox > tbody > tr > td');
        const firstRowDate = await name((await tbls[0].$$('table > tbody > tr > th'))[1]);
        if (firstRowDate === compareDate) { break; }
        compareDate = firstRowDate;

        if (weekIdx < tgtWeek) {
          const nextWeek = (await page.$$('.wmmove > a'))[1];
          await click(page, nextWeek, logObj(`${m}->skipWeek(${weekIdx})`));
          weekIdx++;
          continue;
        }

        const day = (await page.$$('th > .day')).slice(0, 7);
        const week = await Promise.all(day.map(async d => await name(d)));
        const year = await name(await selected(await (await page.$('#optYear')).$$('option')));

        await Promise.all(tbls.map(async (tbl) => {
          let subOrg: string = null;
          const data: string[][][] = [];
          const org = await name(await tbl.$('.clearfix.kaikan_title'));

          for (const row of await tbl.$$('tr')) {
            const s = await row.$('.shisetu_name > .clearfix');

            subOrg = (s && await name(s)) || subOrg;
            const t = await row.$('.facmdstime');
            const time = t && await name(t);
            t && await log(logObj(`${reqRegion} ${weekIdx} ${org} ${subOrg} ${time}`));

            data.push(await Promise.all((await row.$$('td img')).map(async (img, imgIdx) => {
              const maruFlg = (await img.evaluate(e => e.getAttribute('src'))).includes('maru');
              return maruFlg && [subOrg, `${year}年${week[imgIdx]} | ${time}`];
            })));
          }

          data.map(d => (d.map((e) => {
            if (e) {
              resObj[org] ||= {};
              resObj[org][e[0]] ||= {};
              resObj[org][e[0]][subGenreName] ||= [];
              resObj[org][e[0]][subGenreName].push(e[1]);
            }
          })));
        }));

        const nextWeek = (await page.$$('.wmmove > a'))[1];
        await click(page, nextWeek, logObj(`${m}->nextWeek(${weekIdx+1})`));
        weekIdx++;
      }

      const undoCalendar = await page.$('#pagerbox > a');
      await click(page, undoCalendar, logObj(`${m}->undoCalendar`));
      const undoSubOrg = await page.$('#pagerbox > a');
      await click(page, undoSubOrg, logObj(`${msg}->${subGenreName}->undoSubOrg`));
    }

    await browser.close();
    await cli.set(`opas?region=${reqRegion}&genre=${reqGenre}`, JSON.stringify(resObj));
    await log(logObj(`done: ${reqRegion} ${reqGenre}`));
  } catch {
    await browser.close();
    console.log(`error ${reqRegion} ${reqGenre}: next starts from subgenre${reqTgtSubgenre}, week${reqTgtWeek}`);
    await scrap(resObj, cli, reqRegion, reqGenre, reqTgtSubgenre, reqTgtWeek);
  }
}

async function log(logObj: Log) {
  process.env.test && await appendFile(`log/${logObj.region}${logObj.genre}.log`, logObj.log + '\n');
  console.log(logObj.log);
}

async function click(page: Page, element: ElementHandle, logObj: Log) {
  await element.click();
  await page.waitForNavigation({ waitUntil: 'networkidle0' });
  await log(logObj);
  return logObj.log;
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

async function selected(elements: ElementHandle[]) {
  return (await Promise.all(elements.filter(async e => await e.evaluate(el => el.getAttribute('selected')))))[0];
}

interface Response {
  [org: string]: {
    [subOrg: string]: {
      [subGenre: string]: string[];
    };
  };
}

interface Log {
  region: string;
  genre: string;
  log: string;
}