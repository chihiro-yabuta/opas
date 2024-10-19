import { RedisClientType } from 'redis';
import axios, { AxiosResponse } from 'axios';
import { JSDOM } from 'jsdom';
import { base, genreSlct, login, agent, Response, Org, regions, genres } from './data';

export async function crawl(cli: RedisClientType, genre: string, key: string) {
  try {
    let orgMap: Org = {};
    let resObj: Response = {};
    const subGenres = await selectP0(genre);
    await Promise.all(subGenres.map(async (subGenre) => {
      await enter(orgMap, encodeURIComponent(genre), encodeURIComponent(subGenre));
    }));
    await Promise.all(Object.entries(orgMap).map(async ([regionId, subOrgs]) => {
      resObj[regions[regionId][1]] ||= {};
      const subGenreCnt: { [id: string]: number } = {};
      const subGenreMap: { [id: string]: string } = {};
      Object.values(subOrgs).map(e => e.subGenres.map((e) => {
        subGenreCnt[e.id] ||= 0;
        subGenreCnt[e.id] += 1;
      }));
      Object.values(subOrgs).map((e) => {
        let [i, id] = [0, ''];
        e.subGenres.map((e) => {
          if (i < subGenreCnt[e.id]) {
            i = subGenreCnt[e.id];
            id = e.id;
          }
        });
        subGenreMap[`&shubetsuCd=${id}`] ||= '';
        subGenreMap[`&shubetsuCd=${id}`] += `&checkMeisaiUniqKey=${e.id}`;
      });
      await Promise.all(Object.entries(subGenreMap).map(async ([subGenreId, subOrgKey]) => {
        await calendar(resObj[regions[regionId][1]], orgMap[regionId], regionId, subGenreId, subOrgKey);
      }));
    }));
    await cli.set('opas', JSON.stringify({ status: 'success', key: key, msg: 'done' }));
    await Promise.all(Object.entries(resObj).map(async ([k, v]) => await cli.set(`${key}&region=${k}`, JSON.stringify(v))));
  } catch (e) {
    await cli.set('opas', JSON.stringify({ status: 'error', key: key, msg: e.message }));
  }
}

async function calendar(resObj: Response[string], subOrgMap: Org[string], regionId: string, subGenreId: string, subGenreKey: string) {
  let [init, sessionId, webId] = await initCalendar(regionId, subGenreId, subGenreKey);
  let firstRowDate = await scrape(resObj, subOrgMap, init.data, '');
  const date = new Date(firstRowDate);
  const slct = (new Set(subGenreKey.split('&checkMeisaiUniqKey=').map(e => e.slice(0, -3)))).size > 2 ? 'Browser' : 'Select';
  const maxDate = new Date(firstRowDate);
  maxDate.setMonth(maxDate.getMonth() + 2);
  maxDate.setDate(maxDate.getDate() - maxDate.getDay() - 2);

  while (1) {
    date.setDate(date.getDate() + 7);
    try {
      const res = await axios.post(
        `${base}${regions[regionId][0]}/yoyaku/CalendarStatus${slct}.cgi`,
        `action=Setup&optYear=${date.getFullYear()}&optMonth=${padding(date.getMonth()+1)}&optDay=${padding(date.getDate())}`,
        { headers: { Cookie: `${sessionId};${webId}` }, httpsAgent: agent, responseType: 'arraybuffer' }
      );
      if (new JSDOM(res.data).window.document.getElementById('formMain').getAttribute('name').includes('error')) {
        console.log('continue', regions[regionId][1], date);
        await new Promise(resolve => setTimeout(resolve, 3000));
        [, sessionId, webId] = await initCalendar(regionId, subGenreId, subGenreKey);
        date.setDate(date.getDate() - 7);
      } else {
        console.log('success', regions[regionId][1], date);
        firstRowDate = await scrape(resObj, subOrgMap, res.data, firstRowDate);
        if (!firstRowDate) break;
        if (new Date(firstRowDate) > maxDate) break;
      }
    } catch {
      console.log('error', regions[regionId][1], date);
      await new Promise(resolve => setTimeout(resolve, 10000));
      [, sessionId, webId] = await initCalendar(regionId, subGenreId, subGenreKey);
      date.setDate(date.getDate() - 7);
    }
  }
}

async function initCalendar(regionId: string, subGenreId: string, subGenreKey: string) {
  const url = `${base}${regions[regionId][0]}/${login}?action=FROM_PORTAL_TO_CALENDAR`;
  const init = await axios.get(
    `${url}${subGenreKey}${subGenreId}`, { httpsAgent: agent, responseType: 'arraybuffer' }
  );
  const cookie = init.headers['set-cookie'].join(';');
  const sessionId = cookie.match(/JSESSIONID=[^;]+/)[0];
  const webId = cookie.match(/vyrqgyw=[^;]+/)[0];
  return [init, sessionId, webId] as [AxiosResponse, string, string];
}

async function scrape(resObj: Response[string], subOrgMap: Org[string], data: ArrayBuffer, compareDate: string) {
  let obj = resObj;
  const document = (new JSDOM(new TextDecoder('shift-JIS').decode(new Uint8Array(data)))).window.document;
  const tbls = [...document.querySelectorAll('#facilitiesbox > tbody > tr > td')];

  const week = [...document.querySelectorAll('th > .day')].slice(0, 7).map(d => d.textContent.trim());
  const year = [...document.querySelectorAll('#optYear option')].filter(e => e.getAttribute('selected'))[0].textContent.trim();

  const firstRowDate = year + tbls[0].querySelectorAll('table > tbody > tr > th')[1].textContent.trim().replace(/(\d+)月(\d+)日/, '/$1/$2');
  if (firstRowDate === compareDate) return '';

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
      e && Object.entries(subOrgMap).map(([k, v]) => {
        `${org}|${e[0]}`.includes(k) && v.subGenres.map((subGenre) => {
          obj[subGenre.name] ||= {};
          obj[subGenre.name][org] ||= {};
          obj[subGenre.name][org][e[0]] ||= [];
          obj[subGenre.name][org][e[0]].push(e[1]);
        });
      });
    })));
  });

  return firstRowDate;
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

async function enter(orgMap: Org, genre: string, subGenre: string) {
  const region = Object.keys(regions).reduce((acc, curr) => acc + `&checkChidanUniqKey=${curr}`, '');
  const res = new TextDecoder('shift-JIS').decode(new Uint8Array((await axios.post(
    `${base}${genreSlct}`,
    `action=Enter&optDaiGenre=${genres[genre]}_${genre}&optSyoGenre=${subGenre}${region}`,
    { httpsAgent: agent, responseType: 'arraybuffer' }
  )).data));
  const document = (new JSDOM(res)).window.document;
  [...document.querySelectorAll('.shiseSubTable tr')].map((e) => {
    const subOrgId = e.getAttribute('onclick')?.split(',')[1].slice(1, -1);
    if (subOrgId) {
      const name = [...e.querySelectorAll('td')].map(e => e.textContent.trim());
      orgMap[subOrgId.split('_')[0]] ||= {};
      orgMap[subOrgId.split('_')[0]][name.join('|')] ||= { id: subOrgId, subGenres: [] };
      orgMap[subOrgId.split('_')[0]][name.join('|')].subGenres.push({
        id: subGenre.split('_')[0],
        name: decodeURIComponent(subGenre.split('_')[1]),
      });
    }
  });
}

function padding(i: number) {
  return i.toString().padStart(2, '0');
}