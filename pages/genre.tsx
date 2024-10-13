import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Provider, useDispatch } from 'react-redux';
import { IoReload } from 'react-icons/io5';
import { store, slice } from '../store';
import { genres } from  '../store/data';

export function Genre() {
  const dispatch = useDispatch();
  const ref = useRef(null);
  const [genre, setGenre] = useState(genres[0][0]);
  const [isVisible, setIsVisible] = useState(false);
  const [updt, setUpdt] = useState(1);
  const [rotate, setRotate] = useState(0);

  useEffect(() => {
    document.addEventListener('click', e => !ref.current.contains(e.target) && setIsVisible(false));
  }, []);
  useEffect(() => { dispatch(slice.actions.sendGenre(genre)); }, [genre]);

  return <>
    <div style={{ display: 'flex', justifyContent: 'space-between', margin: '0 8vw' }}>
      <motion.div
        ref={ref}
        style={{
          textAlign: 'center', border: '2px solid #043ab9', borderRadius: '30px',
          fontSize: '2vw', padding: '10px 0', width: '90%'
        }}
        onClick={() => setIsVisible(true)}
        children={genre}
      />
      <motion.div
        animate={{ rotate: rotate * 360 }}
        style={{ display: 'flex', alignItems: 'center' }}
        onClick={() => {
          setRotate(rotate + 1);
          setUpdt(updt % 2 + 1);
          dispatch(slice.actions.sendUpdt(updt % 2 + 1));
        }}
        children={<IoReload size='4vw' />}
        transition={{ duration: 0.5 }}
      />
    </div>
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: isVisible ? 'auto' : 0, opacity: Number(isVisible) }}
      style={{ overflow: 'hidden' }}
    >
      {genres.map((gl, i) => <div
        key={i}
        style={{ display: 'flex', justifyContent: 'center' }}
      >
        {...gl.map((g, n) => <motion.div
          key={i * 3 + n}
          initial={{ backgroundColor: '#ffffff', border: '2px solid #84a2d4' }}
          whileHover={{ backgroundColor: '#e0ffff' }}
          animate={{ border: `2px solid ${genre === g ? '#043ab9' : '#84a2d4'}` }}
          style={{
            width: '25%', textAlign: 'center', borderRadius: '30px',
            fontSize: '1.5vw', margin: '10px 1%', padding: '10px 0',
          }}
          onClick={() => setGenre(g)}
          children={g}
        />)}
      </div>)}
    </motion.div>
  </>
}

export default function Index() {
  return <Provider store={store}>
    <Genre />
  </Provider>
}