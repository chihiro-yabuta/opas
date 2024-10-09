import React, { useState, useEffect } from 'react';
import { Provider, useSelector } from 'react-redux';
import Head from 'next/head';
import { store, RootState } from '../store';
import { Response, Status, initData, regions } from '../store/data';
import { Genre } from './genre';
import { Region } from './region';
import { Calendar } from './calendar';
import { Notice } from './notice';

function App() {
  const [status, setStatus] = useState({} as Status);
  const [data, setData] = useState(initData as Response);
  const region = useSelector((state: RootState) => state.region);
  const genre = useSelector((state: RootState) => state.genre);

  const updateData = (res: any, regionName: string, genreName: string) => {
    res.status
      ? setStatus((prevData) => { return { ...prevData, [res.key]: res } })
      : setStatus((prevData) => { return { ...prevData, [`opas?region=${regionName}&genre=${genreName}`]: null } })
    ;
    !res.status && setData((prevData) => { return { ...prevData, [regionName]: res } });
  }

  const fetchData = (updt: boolean, regionName: string, genreName: string) => {
    if (regions[regionName].includes(genreName)) {
      const key = `/api?region=${regionName}&genre=${genreName}`;
      fetch(key + (updt ? '&updt=true' : '')).then((res) => res.json()).then((res) => {
        updateData(res, regionName, genreName);
        const id = updt && res.status === 'in-progress'
          && res.key.match(/region=([^&]+)/)[1] === regionName
          && res.key.match(/genre=([^&]+)/)[1] === genreName
        && setInterval(() => {
          fetch(key).then((res) => res.json()).then((res) => {
            if (res.status !== 'in-progress') {
              updateData(res, regionName, genreName);
              clearInterval(id);
            }
          });
        }, 3000);
      });
    } else {
      const key = `opas?region=${region}&genre=${genre}`;
      setStatus((prevData) => { return { ...prevData, [key]: { status: 'skip', key: key, msg: 'not exists' } } });
    }
  }

  useEffect(() => {
    if(genre) {
      setStatus({} as Status);
      setData(initData as Response);
      Object.keys(initData).map(r => fetchData(false, r, genre));
    }
  }, [genre]);
  useEffect(() => { region && genre && fetchData(true, region, genre); }, [region, genre]);

  return <div style={{ marginBottom: '50px' }}>
    <Head>
      <title>OPAS NEXT</title>
      <link rel='icon' href='https://www.opas.jp/icon/favicon.ico' />
    </Head>
    <Notice region={region} genre={genre} status={status} />
    <a href='https://reserve.opas.jp/portal/menu/DantaiSelect.cgi?action=ReNew' style={{ display: 'flex', justifyContent: 'center' }} target='_blank'>
      <img style={{ width: '80%' }} src='https://reserve.opas.jp/portal/img/std/title/mainImage.gif' />
    </a>
    <p style={{ fontSize: '1.5vw' }}>利用目的を選択して下さい</p>
    <p style={{ fontSize: '1.5vw' }}>選択すると利用可能時間を更新します</p>
    <Genre status={status} />
    <p style={{ fontSize: '1.5vw' }}>地域を選択して下さい</p>
    <p style={{ fontSize: '1.5vw' }}>選択すると利用可能時間を更新します</p>
    <Region status={status} />
    <p style={{ fontSize: '1.5vw' }}>選択している目的別の利用可能時間を全地域、色別に表示します</p>
    <p style={{ fontSize: '1.5vw' }}>日付を選択すると選択している地域別に利用可能な施設を表示します</p>
    <Calendar data={data} />
  </div>
}

export default function Index() {
  return <Provider store={store}>
    <App />
  </Provider>
}