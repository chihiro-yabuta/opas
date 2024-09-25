import React, { useState, useEffect } from 'react';
import { initData, genres, regions } from './data';

export default function Home() {
  const [data, setData] = useState(initData);
  const [region, setRegion] = useState(Object.keys(regions)[0]);
  const [genre, setGenre] = useState(genres[0]);

  const fetchData = (updt?: boolean) => {
    if (regions[region].includes(genre)) {
      const f = updt ? '&updt=true' : '';
      const key = `/api?region=${region}&genre=${genre}${f}`;
      fetch(key).then((res) => res.json()).then((data) => {
        setData((prevData) => { return { ...prevData, [region]: data } });
      });
    } else {
      setData((prevData) => { return { ...prevData, [region]: 'not found' } });
    }
  }

  useEffect(() => { fetchData(); }, [region, genre]);

  return (
    <>
      <select onChange={e => setRegion(e.target.value)}>
        {...Object.keys(regions)
          .map((e, i) => <option key={i} value={e}>{e}</option>)}
      </select>
      <select onChange={e => setGenre(e.target.value)}>
        {...genres
          .map((e, i) => <option key={i} value={e}>{e}</option>)}
      </select>
      <button>update</button>
      {JSON.stringify(data)}
    </>
  )
}