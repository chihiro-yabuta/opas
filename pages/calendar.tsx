import React from 'react';
import { Provider } from 'react-redux';
import { store } from '../store';
import { color } from '../store/data';
import { mockData } from '../store/mock';

export function Calendar(props: { data: Response }) {
  const range: Range = {};
  const re = (e: string) => e.match(/(\d+)年(\d+)月(\d+)日/).slice(1, 4).join('/');
  const isRegion = (e: any): e is Region => !e.status;

  Object.values(props.data).map((e, i) => {isRegion(e) &&
    Object.values(e).map(e => Object.values(e).map(e => Object.values(e))).flat(3).map((s) => {
      const [jaDate, time] = s.split(' | ');
      const reDate = re(jaDate);
      const [shour, _, ehour, emin] = time.match(/\d+/g).map(Number);
      range[reDate] ||= Array.from({ length: 18 }, () => []);
      for (let n = shour; n < ehour + Number(Boolean(emin)); n++) {
        !range[reDate][i].includes(n) && range[reDate][i].push(n);
      }
    });
  });

  const date = new Date();
  date.setDate(date.getDate() - date.getDay());
  const maxDate = new Date(Math.max(...Object.keys(range).map(e => new Date(e).getTime()), date.getTime()));
  maxDate.setDate(maxDate.getDate() - maxDate.getDay() + 6);

  let l = [date.toLocaleDateString('ja-JP')];
  const headers: string[][] = [];
  while (date < maxDate) {
    date.setDate(date.getDate() + 1);
    l.push(date.toLocaleDateString('ja-JP'));
    if (l.length === 7) {
      headers.push(l);
      l = [];
    }
  }

  return <table style={{ width: '100%', borderCollapse: 'collapse' }}>
    {headers.map((header, i) => <tbody key={`0_${i}`}>
      <Header key={`1_${i}`} header={header} childKey={`1_${i}`} colSpan={18} />
      <TimeTable
        key={`2_${i}`}
        header={header}
        range={range}
        childKey={`2_${i}`}
      />
    </tbody>)}
  </table>
}

function Header(props: { header: string[], childKey: React.Key, colSpan?: number }) {
  const color = (i: number) => i === 0 ? '#ff0000' : i === 6 ? '#274a78' : '#0095d9';
  return <tr>
    <th style={{  width: '1.5vw' }} />
    {props.header.map((e, i) => <th
      key={`${props.childKey}_${i}`}
      style={{ border: `solid 1px ${color(i)}`, color: color(i), fontSize: '1.5vw', padding: '5px 0' }}
      colSpan={props.colSpan}
      children={e}
    />)}
    <th style={{  width: '1.5vw' }} />
  </tr>
}

function TimeTable(props: { header: string[], range: Range, childKey: React.Key, onClick?: Function }) {
  return Array.from({ length: 24 }).map((_, i) => <tr key={`${props.childKey}_${i}`}>
    {props.header.map((e, f) => Array.from({ length: f === 0 || f === 6 ? 19 : 18 }).map((_, n) => <td
      key={`${props.childKey}_${i}_${f}_${n}`}
      style={{
        backgroundColor: `${props.range[e]?.[n - Number(f === 0)]?.includes(i) ? color[n - Number(f === 0)] : '#ffffff'}`,
        height: '10px', textAlign: f === 0 && n === 0 ? 'right' : 'left',
        borderTop: i % 4 === 0 && 'solid 0.1px #84a2d4', borderLeft: n === Number(f === 0) && 'solid 0.1px #84a2d4',
        borderBottom: i === 23 && 'solid 0.1px #84a2d4', borderRight: f === 6 && n === 17 && 'solid 0.1px #84a2d4'
      }}
    ><div
    style={{
      margin: '0', fontSize: '0.15vw', width: '0.3vw',
      transformOrigin: 'left bottom', transform: 'scale(5)'
    }}
    >{i % 4 === 3 && i < 23 && ((f === 0 && n === 0) || (f === 6 && n === 18)) ? `${i+1}時` : ''}</div></td>))}
  </tr>)
}

interface Status {
  status: 'in-progress' | 'skip' | 'error';
  key: string;
  msg: string;
}

interface Region {
  [subGenre: string]: {
    [org: string]: {
      [subOrg: string]: string[];
    };
  }
}

interface Response {
  [region: string]: Region | Status;
}

interface Range {
  [date: string]: number[][];
}

export default function Index() {
  return <Provider store={store}>
    <Calendar data={mockData} />
  </Provider>
}