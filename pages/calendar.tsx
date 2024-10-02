import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Provider, useDispatch } from 'react-redux';
import { store, slice } from '../store';

export function Calendar(props: { data: Response }) {
  return (
    <>
      {JSON.stringify(props.data)}
    </>
  )
}

interface Response {
  [org: string]: {
    [subOrg: string]: {
      [subGenre: string]: string[];
    };
  };
}

export default function Index() {
  return <Provider store={store}>
    <Calendar data={null} />
  </Provider>
}