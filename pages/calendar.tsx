import React, { useState } from 'react';
import { Provider, useSelector } from 'react-redux';
import { store, RootState } from '../store';
import { Response, initData, color } from '../store/data';
import { mockData } from '../store/mock';
const re = (e: string) => e.match(/(\d+)年(\d+)月(\d+)日/).slice(1, 4).join('/');

export function Calendar(props: { data: Response }) {
  const [slctDate, setSlctDate] = useState('');
  const range: Range = {};
  const regionLen = Object.values(props.data).length;

  Object.values(props.data).map((e, i) => { Object.keys(e).length &&
    Object.values(e).map(e => Object.values(e).map(e => Object.values(e))).flat(3).map((s) => {
      const [jaDate, time] = s.split(' | ');
      const reDate = re(jaDate);
      range[reDate] ||= Array.from({ length: regionLen }, () => []);
      range[reDate][i] = getTimes(range[reDate][i], time);
    });
  });

  const date = new Date();
  date.setDate(date.getDate() - date.getDay());
  const maxDate = new Date(Math.max(...Object.keys(range).map(e => new Date(e).getTime()), date.getTime()));
  maxDate.setDate(maxDate.getDate() - maxDate.getDay() + 6);

  let l: Header[] = [{ title: date.toLocaleDateString('ja-JP'), colSpan: regionLen }];
  const headers: Header[][] = [];
  while (date < maxDate) {
    date.setDate(date.getDate() + 1);
    l.push({ title: date.toLocaleDateString('ja-JP'), colSpan: regionLen });
    if (l.length === 7) {
      headers.push(l);
      l = [];
    }
  }

  const region = useSelector((state: RootState) => state.region);
  const data = props.data[region ? region : '高石市'];
  return <>
    {Object.keys(data).length && slctDate ? <Detail data={data} date={slctDate} /> : null}
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      {headers.map((header, i) => <tbody key={`0_${i}`}>
        <Header key={`1_${i}`} header={header} childKey={`1_${i}`} week />
        <TimeTable
          key={`2_${i}`}
          header={header}
          range={range}
          rangeLen={regionLen}
          childKey={`2_${i}`}
          week
          onClick={setSlctDate}
        />
      </tbody>)}
    </table>
  </>
}

function Detail(props: { data: Response[string], date: string }) {
  const range: Range = {};
  Object.entries(props.data).map(([subGenreName, subGenre]) => {
    Object.entries(subGenre).map(([orgName, org]) => {
      Object.entries(org).map(([subOrgName, subOrg]) => {
        const name = `${subOrgName}:sep:${orgName}:sep:${subGenreName}`;
        subOrg.map(s => {
          range[name] ||= [[]];
          const [jaDate, time] = s.split(' | ');
          range[name][0] = props.date === re(jaDate) ? getTimes(range[name][0], time) : range[name][0];
        });
        !range[name][0].length && delete range[name];
      });
    });
  });

  const subGenreNames = getSet(Object.keys(range).map(e => e.split(':sep:')[2]));
  const orgNames = getSet(Object.keys(range).map(e => e.split(':sep:').slice(1, 3).join(':sep:')));
  const subOrgNames = getSet(Object.keys(range));

  return <table style={{ width: '100%', borderCollapse: 'collapse' }}>
    <tbody>
      <Header header={[{ title: props.date, colSpan: Object.keys(range).length }]} childKey={3} />
      <Header header={subGenreNames} childKey={3} />
      <Header header={orgNames} childKey={4} />
      <Header header={subOrgNames} childKey={5} />
      <TimeTable
        header={subOrgNames}
        range={range}
        rangeLen={1}
        childKey={6}
      />
    </tbody>
  </table>
}

function Header(props: { header: Header[], childKey: React.Key, week?: boolean }) {
  const color = (i: number) => i === 0 ? '#ff0000' : i === 6 ? '#274a78' : '#0095d9';
  const size = 10 / props.header.length;
  return <tr>
    <th style={{  width: '1.5vw' }} />
    {props.header.map((e, i) => <th
      key={`${props.childKey}_${i}`}
      style={{
        height: '35px', border: 'solid 1px #0095d9',color: props.week ? color(i) : '#0095d9',
        fontSize: `${1.5 < size ? 1.5 : size < 0.8 ? 0.8 : size}vw`
      }}
      colSpan={e.colSpan}
      children={e.title.split(':sep:')[0]}
    />)}
    <th style={{  width: '1.5vw' }} />
  </tr>
}

function TimeTable(props: { header: Header[], range: Range, rangeLen: number, childKey: React.Key, week?: boolean, onClick?: React.Dispatch<React.SetStateAction<string>> }) {
  const region = useSelector((state: RootState) => state.region);
  const regionIdx = Object.keys(initData).indexOf(region ? region : '高石市' );
  const headerLen = props.header.length - 1;

  return Array.from({ length: 24 }).map((_, i) => <tr key={`${props.childKey}_${i}`}>
    {props.header.map((e, f) => Array.from({ length: props.rangeLen+Number(f === 0)+Number(f === headerLen) }).map((_, n) => <td
      key={`${props.childKey}_${i}_${f}_${n}`}
      style={{
        backgroundColor: `${props.range[e.title]?.[n - Number(f === 0)]?.includes(i) ? props.week ? color[n - Number(f === 0)] : '#0095d9' : '#ffffff'}`,
        height: '10px', textAlign: f === 0 && n === 0 ? 'right' : 'left',
        borderTop: i % 4 === 0 ? 'solid 0.1px #84a2d4' : 'none', borderLeft: n === Number(f === 0) ? 'solid 0.1px #84a2d4': 'none',
        borderBottom: i === 23 ? 'solid 0.1px #84a2d4': 'none', borderRight: f === headerLen && n === props.rangeLen-Number(f !== 0) ? 'solid 0.1px #84a2d4': 'none'
      }}
      onClick={() => props.range[e.title]?.[regionIdx]?.length && props.onClick?.(e.title)}
    ><p
    style={{
      margin: '0', fontSize: '0.15vw', width: '0.3vw',
      transformOrigin: 'left bottom', transform: 'scale(5)'
    }}
    >{i % 4 === 3 && i !== 23 && ((f === 0 && n === 0) || (f === headerLen && n === props.rangeLen+Number(f === 0))) ? `${i+1}時` : ''}</p></td>))}
  </tr>)
}

function getTimes(prev: number[], time: string) {
  const l = prev;
  const [shour, _, ehour, emin] = time.match(/\d+/g).map(Number);
  for (let n = shour; n < ehour + Number(Boolean(emin)); n++) {
    !l.includes(n) && l.push(n);
  }
  return l;
}

function getSet(names: string[]) {
  const d: { [n: string]: number } = {};
  names.map(e => {
    d[e] = d[e] ? d[e] + 1 : 1;
  });
  return Object.entries(d).map(([k, v]) => { return { title: k, colSpan: v } }) as Header[];
}

interface Range {
  [date: string]: number[][];
}

interface Header {
  title: string;
  colSpan: number;
}

export default function Index() {
  return <Provider store={store}>
    <Calendar data={mockData} />
  </Provider>
}