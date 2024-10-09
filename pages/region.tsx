import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Provider, useDispatch } from 'react-redux';
import { store, slice } from '../store';
import { Status, initData, color } from  '../store/data';

export function Region(props: { status: Status }) {
  const regions = Object.keys(initData);
  const dispatch = useDispatch();
  const [region, setRegion] = useState(regions[0]);

  useEffect(() => { dispatch(slice.actions.sendRegion(region)); }, [region]);

  const statuses = Object.values(props.status);
  const inProgressIdx = statuses.map(e => e?.status).indexOf('in-progress');
  useEffect(() => {
    inProgressIdx !== -1 && setRegion(statuses.map(e => e?.key)[inProgressIdx].match(/region=([^&]+)/)[1]);
  }, [inProgressIdx]);

  return <table style={{ width: '100%', borderCollapse: 'collapse' }}><tbody><tr>
    {regions.map((r, i) => <motion.td
      key={i}
      initial={{ backgroundColor: '#ffffff' }}
      whileHover={{ backgroundColor: `${region === r ? '#84a2d4' : '#e0ffff'}` }}
      animate={{ backgroundColor: `${region === r ? '#84a2d4' : '#ffffff'}` }}
      style={{
        writingMode: 'vertical-rl', textAlign: 'center', color: color[i],
        border: 'solid 2px #84a2d4', fontSize: '2vw', padding: '20px 0',
      }}
      onClick={() => inProgressIdx === -1 && setRegion(r)}
      children={r}
    />)}
  </tr></tbody></table>
}

export default function Index() {
  return <Provider store={store}>
    <Region status={{} as Status} />
  </Provider>
}