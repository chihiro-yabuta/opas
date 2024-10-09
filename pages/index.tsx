import React, { useState, useEffect } from 'react';
import { Provider, useSelector } from 'react-redux';
import { store, RootState } from '../store';
import { Response, Status, initData, regions, genres } from '../store/data';
import { Genre } from './genre';
import { Region } from './region';
import { Calendar } from './calendar';
import { Notice } from './notice';

function App() {
  const [status, setStatus] = useState(initData as Status);
  const [data, setData] = useState(initData as Response);
  const region = useSelector((state: RootState) => state.region);
  const genre = useSelector((state: RootState) => state.genre);

  const updateData = (res: any, regionName: string) => {
    setStatus((prevData) => { return { ...prevData, [regionName]: res.status && res } });
    !res.status && setData((prevData) => { return { ...prevData, [regionName]: res } });
  }

  const fetchData = (updt: boolean, regionName: string, genreName: string) => {
    if (regions[regionName].includes(genreName)) {
      const key = `/api?region=${regionName}&genre=${genreName}`;
      fetch(key + (updt ? '&updt=true' : '')).then((res) => res.json()).then((res) => {
        updateData(res, regionName);
        const id = updt && res.status === 'in-progress' && setInterval(() => {
          fetch(key).then((res) => res.json()).then((res) => {
            if (res.status !== 'in-progress') {
              updateData(res, regionName);
              clearInterval(id);
            }
          });
        }, 3000);
      });
    } else {
      const key = `opas?region=${region}&genre=${genre}`;
      setStatus((prevData) => { return { ...prevData, [regionName]: { status: 'skip', key: key, msg: 'not exists' } } });
    }
  }

  useEffect(() => { Object.keys(initData).map(r => fetchData(false, r, genres[0][0])); }, []);
  useEffect(() => { region && genre && fetchData(true, region, genre); }, [region, genre]);

  return <>
    <Notice status={status[region]} />
    <Genre status={status} />
    <Region status={status} />
    <Calendar data={data} />
  </>
}

export default function Index() {
  return <Provider store={store}>
    <App />
  </Provider>
}