import '../../index.css';
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { slice } from '../../redux';

export const Input = () => {
  const [str, setstr] = useState('');

  const dispatch = useDispatch();
  const { sendstr } = slice.actions;

  useEffect(() => { dispatch(sendstr(str)) }, [str]);
  return (
    <>
      <input
        type={'text'}
        value={str}
        onChange={(e) => {
          setstr(e.target.value);
        }}
      />
    </>
  );
}