import '../../index.css';
import React, { useState } from 'react';
import { store } from '../../redux';

export const Output = () => {
  const [str, setstr] = useState('');
  return (
    <>
      <button
        onClick={ () => {
          setstr(store.getState().str)
        }}
      >done</button>
      <p className='title'>{str}</p>
    </>
  );
}