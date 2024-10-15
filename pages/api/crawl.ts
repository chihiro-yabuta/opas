import axios from 'axios';
import { JSDOM } from 'jsdom';
import { base, genreSlct, login, agent, Response, regions, genres } from './data';

export async function crawl(genre: string) {
  let resObj: Response = {};
  const subGenres = await selectP0(genre);
  await Promise.all(subGenres.map(async (subGenre) => {
    const subOrgMap = await enter(encodeURIComponent(genre), encodeURIComponent(subGenre));
    await Promise.all(Object.entries(subOrgMap).map(async ([k, v]) => {
      resObj = await calendar(resObj, genre, subGenre, k, v);
    }));
  }));
  return resObj;
}

async function selectP0(genre: string) {
  const res = new TextDecoder('shift-JIS').decode(new Uint8Array((await axios.post(
    `${base}${genreSlct}`,
    `action=SelectP0&optDaiGenre=${genres[genre]}_${encodeURIComponent(genre)}`,
    { httpsAgent: agent, responseType: 'arraybuffer' }
  )).data));
  const document = (new JSDOM(res)).window.document;
  return [...document.querySelectorAll('[name="optSyoGenre"] option')]
    .map(e => e.getAttribute('value'))
    .filter(e => e)
  ;
}

async function enter(genre: string, subGenre: string) {
  const d: { [region: string]: string } = {};
  const region = Object.keys(regions).reduce((acc, curr) => acc + `&checkChidanUniqKey=${curr}`, '');
  const res = new TextDecoder('shift-JIS').decode(new Uint8Array((await axios.post(
    `${base}${genreSlct}`,
    `action=Enter&optDaiGenre=${genres[genre]}_${genre}&optSyoGenre=${subGenre}${region}`,
    { httpsAgent: agent, responseType: 'arraybuffer' }
  )).data));
  const document = (new JSDOM(res)).window.document;
  [...document.querySelectorAll('.shiseSubTable tr')].map((e) => {
    const subOrg = e.getAttribute('onclick')?.split(',')[1].slice(1, -1);
    if (subOrg) {
      d[subOrg.split('_')[0]] ||= '';
      d[subOrg.split('_')[0]] += `&checkMeisaiUniqKey=${subOrg}`;
    }
  });
  return d;
}

async function calendar(resObj: Response, genre: string, subGenre: string, regionKey: string, subOrgKey: string) {
  const cd = `metaShubetsuCd=${genres[genre]}&shubetsuCd=${subGenre.split('_')[0]}`;
  const url = `${base}${regions[regionKey]}/${login}?action=FROM_PORTAL_TO_CALENDAR${subOrgKey}&${cd}`;

  let [obj, firstRowDate] = [resObj, ''];
  const init = await axios.get(
    url, { httpsAgent: agent, responseType: 'arraybuffer' }
  );
  [obj, firstRowDate] = await scrape(obj, init.data, subGenre.split('_')[1], regionKey, '');

  const date = new Date();
  const slct = (new Set(subOrgKey.split('&checkMeisaiUniqKey=').map(e => e.slice(0, -3)))).size > 2 ? 'Browser' : 'Select';
  const cookie = init.headers['set-cookie'].join(';');
  const sessionId = cookie.match(/JSESSIONID=[^;]+/)[0];
  const webId = cookie.match(/vyrqgyw=[^;]+/)[0];

  while (1) {
    date.setDate(date.getDate() + 7);
    const res = await axios.post(
      `${base}${regions[regionKey]}/yoyaku/CalendarStatus${slct}.cgi`,
      `action=Setup&optYear=${date.getFullYear()}&optMonth=${padding(date.getMonth()+1)}&optDay=${padding(date.getDate())}`,
      { headers: { Cookie: `${sessionId};${webId}` }, httpsAgent: agent, responseType: 'arraybuffer' }
    );
    if (new JSDOM(res.data).window.document.getElementById('formMain').getAttribute('name').includes('error')) {
      console.log(
        new TextDecoder('shift-JIS').decode(new Uint8Array(res.data)),
        url,
        `${base}${regions[regionKey]}yoyaku/CalendarStatus${slct}.cgi`,
        `action=Setup&optYear=${date.getFullYear()}&optMonth=${padding(date.getMonth() + 1)}&optDay=${padding(date.getDate())}`
      );
    } else {
      console.log(regions[regionKey], date, subGenre.split('_')[1]);
    }
    [obj, firstRowDate] = await scrape(obj, res.data, subGenre.split('_')[1], regionKey, firstRowDate);
    if (!firstRowDate) break;
  }
  return obj;
}

async function scrape(obj: Response, data: ArrayBuffer, subGenre: string, regionKey: string, compareDate: string) {
  let o = obj;
  const document = (new JSDOM(new TextDecoder('shift-JIS').decode(new Uint8Array(data)))).window.document;
  const tbls = [...document.querySelectorAll('#facilitiesbox > tbody > tr > td')];
  const firstRowDate = tbls[0].querySelectorAll('table > tbody > tr > th')[1].textContent.trim();
  if (firstRowDate === compareDate) return [o, ''] as [Response, string];

  const week = [...document.querySelectorAll('th > .day')].slice(0, 7).map(d => d.textContent.trim());
  const year = [...document.querySelectorAll('#optYear option')].filter(e => e.getAttribute('selected'))[0].textContent.trim();

  tbls.map((tbl) => {
    let subOrg: string = null;
    const data: string[][][] = [];
    const org = tbl.querySelector('.clearfix.kaikan_title').textContent.trim();

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
        o[regions[regionKey]] ||= {};
        o[regions[regionKey]][subGenre] ||= {};
        o[regions[regionKey]][subGenre][org] ||= {};
        o[regions[regionKey]][subGenre][org][e[0]] ||= [];
        o[regions[regionKey]][subGenre][org][e[0]].push(e[1]);
      }
    })));
  });

  return [o, firstRowDate] as [Response, string];
}

function padding(i: number) {
  return i.toString().padStart(2, '0');
}