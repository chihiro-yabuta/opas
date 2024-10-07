import React, { useState, useEffect } from 'react';
import { Provider, useSelector } from 'react-redux';
import { store, RootState } from '../store';
import { initData, regions, genres } from '../store/data';
import { Genre } from './genre';
import { Region } from './region';
import { Calendar } from './calendar';

function App() {
  const [data, setData] = useState(initData);
  const region = useSelector((state: RootState) => state.region);
  const genre = useSelector((state: RootState) => state.genre);

  useEffect(() => { Object.keys(initData).map(r => fetchData(false, r, genres[0][0], setData)); }, []);
  useEffect(() => { region && genre && fetchData(true, region, genre, setData); }, [region, genre]);

  return <>
    <Genre />
    <Region />
    <Calendar data={data} />
  </>
}

function fetchData(updt: boolean, region: string, genre: string, setData: React.Dispatch<React.SetStateAction<typeof initData>>) {
  if (regions[region].includes(genre)) {
    const key = `/api?region=${region}&genre=${genre}${updt ? '&updt=true' : ''}`;
    fetch(key).then((res) => res.json()).then((res) => {
      setData((prevData) => { return { ...prevData, [region]: res } });
      const id = updt && res.status === 'in-progress' && setInterval(() => {
        fetch(key).then((res) => res.json()).then((res) => {
          if (res.status !== 'in-progress') {
            setData((prevData) => { return { ...prevData, [region]: res } });
            clearInterval(id);
          }
        });
      }, 3000);
    });
  } else {
    const key = `opas?region=${region}&genre=${genre}`;
    setData((prevData) => { return { ...prevData, [region]: { status: 'skip', key: key, msg: 'not exists' } } });
  }
}

export default function Index() {
  return <Provider store={store}>
    <App />
  </Provider>
}