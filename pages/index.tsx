import React, { useState, useEffect } from 'react';
import { initData, genres, regions } from './data';

export default function Home() {
  const [data, setData] = useState(initData);
  const [genre, setGenre] = useState(genres[0]);

  const fetchData = (updt?: boolean) => {
    Object.keys(regions).map((region) => {
      if (regions[region].includes(genre)) {
        if (Object.keys(data[region]).length === 0) {
          const f = updt ? '&updt=true' : '';
          const key = `/api?region=${region}&genre=${genre}${f}`;
          fetch(key).then((res) => res.json()).then((data) => {
            if (!data.log) {
              setData((prevData) => { return { ...prevData, [region]: data } });
            }
          });
        }
      } else {
        setData((prevData) => { return { ...prevData, [region]: 'not found' } });
      }
    });
  }

  useEffect(() => { fetchData(); }, [genre]);

  return (
    <>
      <select onChange={(e) => { setGenre(e.target.value); setData(initData); }}>
        {...genres
          .map((e, i) => <option key={i} value={e}>{e}</option>)}
      </select>
      <button>update</button>
      {JSON.stringify(data)}
    </>
  )
}