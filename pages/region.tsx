import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Provider, useDispatch } from 'react-redux';
import { store, slice } from '../store';
import { initData } from  '../store/data';

export function Region() {
  const regions = Object.keys(initData);
  const dispatch = useDispatch();
  const [region, setRegion] = useState(regions[0]);

  useEffect(() => { dispatch(slice.actions.sendRegion(region)); }, [region]);

  return <div
    style={{ display: 'flex', justifyContent: 'center' }}
  >
    {regions.map((r, i) => <motion.div
      key={i}
      initial={{ backgroundColor: '#ffffff' }}
      whileHover={{ backgroundColor: `${region === r ? '#84a2d4' : '#e0ffff'}` }}
      animate={{ backgroundColor: `${region === r ? '#84a2d4' : '#ffffff'}` }}
      style={{
        display: 'grid', writingMode: 'vertical-rl', placeItems: 'center',
        boxShadow: '0 0 0 2px #84a2d4', width: '5%', fontSize: '2vw', padding: '20px 0',
      }}
      onClick={() => setRegion(r)}
      children={r}
    />)}
  </div>
}

export default function Index() {
  return <Provider store={store}>
    <Region />
  </Provider>
}