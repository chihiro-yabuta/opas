import React from 'react';
import { Hello } from './components/hello';
import { Input } from './components/input';
import { Output } from './components/output';

export const App = () => {
  return (
    <>
      <Hello />
      <Input />
      <Output />
    </>
  );
}