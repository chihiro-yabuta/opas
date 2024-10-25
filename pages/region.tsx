import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Provider, useDispatch } from 'react-redux';
import { store, slice } from '../store';
import { regionMap, regionColorMap } from  '../store/data';

export function Region() {
  const dispatch = useDispatch();
  const [regions, setRegions] = useState(regionMap);

  useEffect(() => { dispatch(slice.actions.sendRegions(regions)); }, [regions]);

  return <table style={{ width: '100%', borderCollapse: 'collapse' }}><tbody><tr>
    {Object.keys(regionMap).map((r, i) => <motion.td
      key={i}
      initial={{ backgroundColor: '#ffffff' }}
      whileHover={{ backgroundColor: `${regions[r] ? '#84a2d4' : '#e0ffff'}` }}
      animate={{ backgroundColor: `${regions[r] ? '#84a2d4' : '#ffffff'}` }}
      style={{
        textAlign: 'center', color: regionColorMap[i],
        border: 'solid 2px #84a2d4', fontSize: '2vw', padding: '20px 0',
      }}
      onClick={() => {
        const e = { ...regions };
        e[r] = !e[r];
        setRegions(e);
      }}
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