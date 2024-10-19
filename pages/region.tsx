import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Provider, useDispatch } from 'react-redux';
import { store, slice } from '../store';
import { initData, color } from  '../store/data';

export function Region() {
  const regions = Object.keys(initData);
  const dispatch = useDispatch();
  const [region, setRegion] = useState(regions[0]);

  useEffect(() => { dispatch(slice.actions.sendRegion(region)); }, [region]);

  return <table style={{ width: '100%', borderCollapse: 'collapse' }}><tbody><tr>
    {regions.map((r, i) => <motion.td
      key={i}
      initial={{ backgroundColor: '#ffffff' }}
      whileHover={{ backgroundColor: `${region === r ? '#84a2d4' : '#e0ffff'}` }}
      animate={{ backgroundColor: `${region === r ? '#84a2d4' : '#ffffff'}` }}
      style={{
        textAlign: 'center', color: color[i],
        border: 'solid 2px #84a2d4', fontSize: '2vw', padding: '20px 0',
      }}
      onClick={() => setRegion(r)}
      children={<span style={{
       whiteSpace: 'pre',
       writingMode: 'vertical-rl',
       display: 'inline-block',
      }}>{r}</span>}
    />)}
  </tr></tbody></table>
}

export default function Index() {
  return <Provider store={store}>
    <Region />
  </Provider>
}