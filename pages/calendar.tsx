import React, { useState } from 'react';
import { Provider } from 'react-redux';
import { store } from '../store';
import { Detail, HeaderTable, TimeTable } from './detail';
import { Response, Range, Header } from '../store/interface';
import { re, getTimes } from '../store/common';
import { mockData } from '../store/mock';

export function Calendar(props: { data: Response, mockDate?: string }) {
  const [slctDate, setSlctDate] = useState('');
  const range: Range = {};
  const region: string[] = [];
  const regionLen = Object.keys(props.data).length;

  Object.entries(props.data).map(([k, v], i) => {
    region.push(k);
    v && Object.values(v).map(e => Object.values(e).map(e => Object.values(e))).flat(3).map((s) => {
      const [jaDate, time] = s.split(' | ');
      const reDate = re(jaDate);
      range[reDate] ||= Array.from({ length: regionLen }, () => []);
      range[reDate][i] = getTimes(range[reDate][i], time);
    });
  });

  const date = props.mockDate ? new Date(props.mockDate) : new Date();
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

  return <>
    {slctDate ? <Detail
      data={props.data}
      date={slctDate}
      onClick={setSlctDate}
    /> : null}
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      {headers.map((header, i) => <tbody key={`0_${i}`}>
        <HeaderTable key={`1_${i}`} header={header} childKey={`1_${i}`} week />
        <TimeTable
          key={`2_${i}`}
          header={header}
          range={range}
          rangeLen={regionLen}
          childKey={`2_${i}`}
          region={region}
          onClick={setSlctDate}
        />
      </tbody>)}
    </table>
  </>
}

export default function Index() {
  return <Provider store={store}>
    <Calendar data={mockData} mockDate='2024/10/9' />
  </Provider>
}