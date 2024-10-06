import fs from 'fs';
import { appendFile } from 'fs/promises';
import { RedisClientType } from 'redis';
import https from 'https';
import AdmZip from 'adm-zip';
import { Page, Browser, ElementHandle, launch } from 'puppeteer-core';

const url = 'https://download-chromium.appspot.com/dl/Linux?type=snapshots';
const prod = process.env.NODE_ENV === 'production';

export async function scrape(cli: RedisClientType, reqRegion: string, reqGenre: string) {
  let browserInit: Browser;
  let pageInit: Page;
  let resObj: Response = {};
  const key = `opas?region=${reqRegion}&genre=${reqGenre}`;
  const logObj = (l: string): Log => { return { region: reqRegion, genre: reqGenre, log: l } };

  try {
    if (!fs.existsSync('/chromium.zip')) {
      await new Promise<void>((resolve, reject) => https.get(url,
        (res) => https.get(res.headers.location, (r) => {
          const f = fs.createWriteStream('/chromium.zip');
          r.pipe(f);
          f.on('finish', () => {
            f.close();
            resolve();
          });
        })
      ));

      const zip = new AdmZip('/chromium.zip');
      zip.extractAllTo('/', true);
    }
  } catch (error) {
    await cli.set('opas', JSON.stringify({ status: 'error', key: key }));
    await cli.set(key, JSON.stringify({ status: 'dl error', msg: error.message }));
    await log(logObj(`dl error: ${error.message}`));
    return;
  }

  try {
    browserInit = await launch(args);
    pageInit = await browserInit.newPage();
  } catch (error) {
    await cli.set('opas', JSON.stringify({ status: 'error', key: key }));
    await cli.set(key, JSON.stringify({ status: 'init error', msg: error.message }));
    await log(logObj(`init error: ${error.message}`));
    return;
  }

  const init = async (page: Page) => {
    await page.goto('https://reserve.opas.jp/portal/menu/DantaiSelect.cgi?action=ReNew');

    const region = await page.evaluateHandle((reqRegion) => {
      const regions = [...document.querySelectorAll('td')];
      const regionNames = regions.map(e => e.querySelector('img').getAttribute('title').split('ボタン')[0]);
      const regionIdx = regionNames.indexOf(reqRegion);
      return regions[regionIdx];
    }, reqRegion);
    let msg = await click(page, region, logObj(reqRegion));

    const vacant = await page.evaluateHandle(() => {
      return document.querySelector('.btnbox a');
    });
    msg = await click(page, vacant, logObj(`${msg}->vacant`));

    const purpose = await page.evaluateHandle(() => {
      return document.querySelector('[onmouseover]');
    });
    msg = await click(page, purpose, logObj(`${msg}->purpose`));

    const genreProp = await (await page.evaluateHandle((reqGenre) => {
      const genres = [...document.querySelectorAll('[onmouseover]')];
      const genreNames = genres.map(e => e.querySelector('td').textContent.trim());
      const genreIdx = genreNames.indexOf(reqGenre);
      return [genres[genreIdx], genreNames[genreIdx]];
    }, reqGenre)).getProperties();
    const genre = genreProp.get('0').asElement() as ElementHandle;
    const genreName = await genreProp.get('1').jsonValue() as string;
    msg = await click(page, genre, logObj(`${msg}->${genreName}`));

    return msg;
  }

  try {
    let msg = await init(pageInit);
    const length = await pageInit.evaluate(() => document.querySelectorAll('[onmouseover]').length);

    await Promise.all(Array.from({ length: length }).map(async (_, subGenreIdx) => {
      let m = '';
      let pageSubGenre: Page;
      let browserSubGenre: Browser;
      if (subGenreIdx === 0) {
        pageSubGenre = pageInit;
        m = msg;
      } else {
        browserSubGenre = await launch(args);
        pageSubGenre = await browserSubGenre.newPage();
        m = await init(pageSubGenre);
      }

      const subGenreProp = await (await pageSubGenre.evaluateHandle((subGenreIdx) => {
        const subGenres = document.querySelectorAll('[onmouseover]');
        return [subGenres[subGenreIdx], subGenres[subGenreIdx].textContent.trim()];
      }, subGenreIdx)).getProperties();
      const subGenre = subGenreProp.get('0').asElement() as ElementHandle;
      const subGenreName = await subGenreProp.get('1').jsonValue() as string;
      m = await click(pageSubGenre, subGenre, logObj(`${m}->${subGenreName}`));

      const select = await pageSubGenre.evaluateHandle(() => {
        return document.querySelector('.btncenter > a');
      });
      m = await click(pageSubGenre, select, logObj(`${m}->select`));

      const next = await pageSubGenre.evaluateHandle(() => {
        return document.querySelectorAll('#pagerbox > a')[1];
      });
      m = await click(pageSubGenre, next, logObj(`${m}->next`));

      let compareDate = '';
      let weekIdx = 0;
      while (1) {
        const skipWeekHandle = await pageSubGenre.evaluateHandle((compareDate, subGenreName, resObj) => {
          const obj = resObj;
          const tbls = [...document.querySelectorAll('#facilitiesbox > tbody > tr > td')];
          const firstRowDate = tbls[0].querySelectorAll('table > tbody > tr > th')[1].textContent.trim();
          if (firstRowDate === compareDate) { return null; }

          const week = [...document.querySelectorAll('th > .day')].slice(0, 7).map(d => d.textContent.trim());
          const year = [...document.querySelectorAll('#optYear option')].filter(e => e.getAttribute('selected'))[0].textContent.trim();

          tbls.map((tbl) => {
            let subOrg: string = null;
            const data: string[][][] = [];
            const org = document.querySelector('.clearfix.kaikan_title').textContent.trim();

            for (const row of tbl.querySelectorAll('tr')) {
              const s = row.querySelector('.shisetu_name > .clearfix');
              subOrg = (s && s.textContent.trim()) || subOrg;

              data.push([...row.querySelectorAll('td img')].map((img, imgIdx) => {
                const maruFlg = img.getAttribute('src').includes('maru');
                return maruFlg && [subOrg, `${year}年${week[imgIdx]} | ${row.querySelector('.facmdstime').textContent.trim()}`];
              }));
            }

            data.map(d => (d.map((e) => {
              if (e) {
                obj[subGenreName] ||= {};
                obj[subGenreName][org] ||= {};
                obj[subGenreName][org][e[0]] ||= [];
                obj[subGenreName][org][e[0]].push(e[1]);
              }
            })));
          });

          return [document.querySelectorAll('.wmmove > a')[1], firstRowDate, obj];
        }, compareDate, subGenreName, resObj);

        if (await skipWeekHandle.jsonValue()) {
          const skipWeekProp = await skipWeekHandle.getProperties();
          const skipWeek = skipWeekProp.get('0').asElement() as ElementHandle;
          compareDate = await skipWeekProp.get('1').jsonValue() as string;
          resObj = await skipWeekProp.get('2').jsonValue() as Response;

          await click(pageSubGenre, skipWeek, logObj(`${m}->skipWeek(${weekIdx})`));
          weekIdx++;
        } else {
          break;
        }
      }

      await (browserSubGenre || browserInit).close();
    }));

    await cli.set('opas', JSON.stringify({ status: 'success', key: key }));
    await cli.set(key, JSON.stringify(resObj));
    await log(logObj(`done: ${reqRegion}/${reqGenre}`));
  } catch (error) {
    await browserInit.close();
    await cli.set('opas', JSON.stringify({ status: 'error', key: key }));
    await cli.set(key, JSON.stringify({ status: 'main error', msg: error.message }));
    await log(logObj(`main error: ${error.message}`));
    return;
  }
}

async function log(logObj: Log) {
  !prod && await appendFile(`log/${logObj.region}${logObj.genre}.log`, logObj.log + '\n');
  console.log(logObj.log);
}

async function click(page: Page, element: ElementHandle, logObj: Log) {
  await element.click();
  await page.waitForNavigation({ waitUntil: 'networkidle0' });
  await log(logObj);
  return logObj.log;
}

interface Response {
  [subGenre: string]: {
    [org: string]: {
      [subOrg: string]: string[];
    };
  };
}

interface Log {
  region: string;
  genre: string;
  log: string;
}

const args = {
  executablePath: prod ? '/chrome-linux/chrome' : '/usr/bin/chromium',
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
  ],
}