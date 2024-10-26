import { Header } from './interface';

export const re = (e: string) => e.match(/(\d+)年(\d+)月(\d+)日/).slice(1, 4).join('/');

export function getTimes(prev: number[], time: string) {
  const l = prev;
  const [shour, _, ehour, emin] = time.match(/\d+/g).map(Number);
  for (let n = shour; n < ehour + Number(Boolean(emin)); n++) {
    !l.includes(n) && l.push(n);
  }
  return l;
}

export function getSet(names: string[]) {
  const d: { [n: string]: number } = {};
  names.map(e => {
    d[e] = d[e] ? d[e] + 1 : 1;
  });
  return Object.entries(d).map(([k, v]) => { return { title: k, colSpan: v } }) as Header[];
}