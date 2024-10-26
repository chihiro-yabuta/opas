import React from 'react';
import { Provider, useSelector } from 'react-redux';
import { store, RootState } from '../store';
import { motion } from 'framer-motion';
import { Response, Range, Header } from '../store/interface';
import { re, getTimes, getSet } from '../store/common';
import { regionColorMap } from '../store/data';
import { mockData } from '../store/mock';

export function Detail(props: { data: Response, date: string, onClick: React.Dispatch<React.SetStateAction<string>> }) {
  const range: Range = {};
  const regionLen = Object.keys(props.data).length;
  const subGenreNameList: string[][] = Array.from({ length: regionLen }, () => []);

  Object.entries(props.data).map(([regionName, subGenre], i) => {
    Object.entries(subGenre).map(([subGenreName, org]) => {
      subGenreNameList[i].push(subGenreName);
      Object.entries(org).map(([orgName, subOrg]) => {
        Object.entries(subOrg).map(([subOrgName, times]) => {
          const name = `${subOrgName}:sep:${orgName}:sep:${regionName}`;
          times.map(s => {
            range[name] ||= [[]];
            const [jaDate, time] = s.split(' | ');
            range[name][0] = props.date === re(jaDate) ? getTimes(range[name][0], time) : range[name][0];
          });
          !range[name][0].length && delete range[name];
        });
      });
    });
  });

  const genre = useSelector((state: RootState) => state.genre) || 'バレーボール';
  const title = `日付：${props.date}　利用目的：${genre}`;
  const regionNames = getSet(Object.keys(range).map(e => `地域：${e.split(':sep:')[2]}`));
  const subGenreNames = regionNames.map((e, i) => { return { title: `詳細目的：${subGenreNameList[i].join(', ')}`, colSpan: e.colSpan } });
  const orgNames = getSet(Object.keys(range).map(e => e.split(':sep:').slice(1, 3).join(':sep:')));
  const subOrgNames = getSet(Object.keys(range));

  return <motion.div
    initial={{ y: '-100%' }}
    animate={{ y: '0' }}
    style={{
      position: 'fixed', top: '0', left: '0', zIndex: '1',
      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
      width: '100%', height: '100%', backgroundColor: '#00000080'
    }}
    onClick={() => props.onClick('')}
  ><table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#ffffff' }}>
      <tbody>
        <HeaderTable header={[{ title: title, colSpan: Object.keys(range).length }]} childKey={3} />
        <HeaderTable header={regionNames} childKey={4} />
        <HeaderTable header={subGenreNames} childKey={5} />
        <HeaderTable header={orgNames} childKey={6} />
        <HeaderTable header={subOrgNames} childKey={7} />
        <TimeTable
          header={subOrgNames}
          range={range}
          rangeLen={1}
          childKey={8}
        />
      </tbody>
    </table>
  </motion.div>
}

export function HeaderTable(props: { header: Header[], childKey: React.Key, week?: boolean }) {
  const color = (i: number) => i === 0 ? '#ff0000' : i === 6 ? '#274a78' : '#0095d9';
  const size = 10 / props.header.length;
  return <tr style={{ borderTop: 'solid 2px #84a2d4', borderBottom: 'solid 2px #84a2d4' }}>
    <th style={{  width: '1.5vw' }} />
    {props.header.map((e, i) => <th
      key={`${props.childKey}_${i}`}
      style={{
        height: '35px', border: 'solid 2px #84a2d4', color: props.week ? color(i) : '#0095d9',
        fontSize: `${1.5 < size ? 1.5 : size < 0.8 ? 0.8 : size}vw`
      }}
      colSpan={e.colSpan}
      children={e.title.split(':sep:')[0]}
    />)}
    <th style={{ width: '1.5vw' }} />
  </tr>
}

export function TimeTable(props: { header: Header[], range: Range, rangeLen: number, childKey: React.Key, region?: string[], onClick?: React.Dispatch<React.SetStateAction<string>> }) {
  const headerLen = props.header.length - 1;

  return Array.from({ length: 24 }).map((_, i) => <tr key={`${props.childKey}_${i}`}>
    {props.header.map((e, f) => Array.from({ length: props.rangeLen+Number(f === 0)+Number(f === headerLen) }).map((_, n) => <td
      key={`${props.childKey}_${i}_${f}_${n}`}
      style={{
        backgroundColor: `${props.range[e.title]?.[n - Number(f === 0)]?.includes(i) ? props.region ? regionColorMap[props.region[n - Number(f === 0)]] : '#0095D9' : '#ffffff'}`,
        height: '10px', textAlign: f === 0 && n === 0 ? 'right' : 'left',
        borderTop: i % 4 === 0 ? 'solid 1px #84a2d4' : 'none', borderLeft: n === Number(f === 0) ? 'solid 1px #84a2d4': 'none',
        borderBottom: i === 23 ? 'solid 1px #84a2d4': 'none', borderRight: f === headerLen && n === props.rangeLen-Number(f !== 0) ? 'solid 1px #84a2d4': 'none'
      }}
      onClick={() => props.range[e.title]?.[n - Number(f === 0)]?.length && props.onClick?.(e.title)}
    ><p
    style={{
      margin: '0', fontSize: '0.15vw', width: '0.3vw',
      transformOrigin: 'left bottom', transform: 'scale(5)'
    }}
    >{i % 4 === 3 && i !== 23 && ((f === 0 && n === 0) || (f === headerLen && n === props.rangeLen+Number(f === 0))) ? `${i+1}時` : ''}</p></td>))}
  </tr>)
}

export default function Index() {
  return <Provider store={store}>
    <Detail data={mockData} date='2024/10/9' onClick={(_) => {}} />
  </Provider>
}