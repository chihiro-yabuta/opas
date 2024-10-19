import React, { useState, useEffect } from 'react';
import { Provider, useSelector } from 'react-redux';
import Head from 'next/head';
import { store, RootState } from '../store';
import { Response, Status, initData } from '../store/data';
import { Genre } from './genre';
import { Region } from './region';
import { Calendar } from './calendar';
import { Notice } from './notice';

function App() {
  const [status, setStatus] = useState({} as Status);
  const [data, setData] = useState(initData as Response);
  const genre = useSelector((state: RootState) => state.genre);
  const updt = useSelector((state: RootState) => state.updt);

  const updateData = (res: any) => {
    res.status !== 'skip' ? setStatus({
      genre: res.key && res.key.match(/genre=([^&]+)/)[1],
      status: res.status,
      msg: res.msg,
    }) : setStatus({} as Status);
    !res.status && Object.entries(res).map(
      ([k, v]) => setData((p) => { return { ...p, [k]: v } as Response })
    );
  }

  const fetchData = (isUpdt: boolean, genreName: string) => {
    const key = `/api?genre=${genreName}`;
    fetch(key + (isUpdt ? '&updt=true' : '')).then((res) => res.json()).then((res) => {
      updateData(res);
      if (isUpdt && res.status === 'in-progress') {
        const genreKey = res.key.match(/genre=([^&]+)/)[1];
        const id = setInterval(() => {
          fetch(`/api?genre=${genreKey}`).then((res) => res.json()).then((res) => {
            if (res.status !== 'in-progress') {
              updateData(res);
              clearInterval(id);
            }
          });
        }, 3000);
      }
    });
  }

  useEffect(() => {
    if(genre) {
      setStatus({} as Status);
      setData(initData as Response);
      fetchData(false, genre);
    }
  }, [genre]);
  useEffect(() => { updt && status.status !== 'in-progress' && fetchData(true, genre); }, [updt]);

  return <div style={{ marginBottom: '50px' }}>
    <Head>
      <title>OPAS NEXT</title>
      <link rel='icon' href='https://www.opas.jp/icon/favicon.ico' />
    </Head>
    <Notice status={status} />
    <a href='https://reserve.opas.jp/portal/menu/DantaiSelect.cgi?action=ReNew' style={{ display: 'flex', justifyContent: 'center' }} target='_blank'>
      <img style={{ width: '80%' }} src='https://reserve.opas.jp/portal/img/std/title/mainImage.gif' />
    </a>
    <p style={{ fontSize: '1.5vw' }}>利用目的を選択して下さい</p>
    <Genre />
    <p style={{ fontSize: '1.5vw' }}>地域を選択して下さい</p>
    <Region />
    <p style={{ fontSize: '1.5vw' }}>選択している目的別の利用可能時間を全地域、色別に表示します</p>
    <p style={{ fontSize: '1.5vw' }}>リロードボタンを押すと選択している目的の情報を更新します</p>
    <p style={{ fontSize: '1.5vw' }}>日付を選択すると選択している地域別に利用可能な施設を表示します</p>
    <p style={{ fontSize: '1.5vw' }}>負荷軽減のため、1度に更新できる情報は1種類のみです</p>
    <Calendar data={data} />
  </div>
}

export default function Index() {
  return <Provider store={store}>
    <App />
  </Provider>
}