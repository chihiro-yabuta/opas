import React, { useState, useEffect } from 'react';
import { Provider, useSelector } from 'react-redux';
import { store, RootState } from '../store';
import { initData, regions } from '../store/data';
import { Genre } from './genre';
import { Region } from './region';
import { Calendar } from './calendar';

function App() {
  const [data, setData] = useState(initData);
  const region = useSelector((state: RootState) => state.region);
  const genre = useSelector((state: RootState) => state.genre);

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

  useEffect(() => { region && genre && fetchData(); }, [region, genre]);

  return <>
    <Genre />
    <Region />
    <Calendar data={data} />
  </>
}

export default function Index() {
  return <Provider store={store}>
    <App />
  </Provider>
}